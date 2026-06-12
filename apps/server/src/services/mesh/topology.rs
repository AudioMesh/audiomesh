use super::{EdgeStatus, TopologyEdge};
use dashmap::DashMap;

/// Manages the Daisy-Chain tree topology for a mesh room.
///
/// In Daisy-Chain mode, the host sends audio to a subset of peers, and those peers
/// relay the audio stream to further peers. This forms a tree rooted at the host.
/// The TopologyManager tracks this tree and handles self-healing when nodes disconnect.
#[derive(Debug)]
pub struct TopologyManager {
    /// room_id -> list of directed edges in the topology tree
    edges: DashMap<String, Vec<TopologyEdge>>,
    /// Maximum number of children a single node should relay to.
    /// Keeps the tree balanced and prevents overloading any single device.
    pub max_children_per_node: usize,
}

impl TopologyManager {
    pub fn new(max_children_per_node: usize) -> Self {
        Self {
            edges: DashMap::new(),
            max_children_per_node,
        }
    }

    /// Initializes the topology tree for a room (called when a room is created).
    pub fn init_room(&self, room_id: &str) {
        self.edges.insert(room_id.to_string(), Vec::new());
    }

    /// Removes all topology state for a room.
    pub fn remove_room(&self, room_id: &str) {
        self.edges.remove(room_id);
    }

    /// Assigns the best parent node for a new peer joining the room.
    ///
    /// Strategy: Find the node in the tree with the fewest children that hasn't
    /// exceeded `max_children_per_node`. This produces a balanced tree that minimizes
    /// the maximum number of hops from host to any leaf node.
    ///
    /// Returns the peer_id of the assigned parent, or `None` if the tree is empty
    /// (meaning this peer should connect directly to the host).
    pub fn assign_parent(
        &self,
        room_id: &str,
        new_peer_id: &str,
        host_peer_id: &str,
        _all_peer_ids: &[String],
    ) -> Option<String> {
        let mut edges = match self.edges.get_mut(room_id) {
            Some(e) => e,
            None => return None,
        };

        // Count children for each node currently in the tree (the host + all connected peers)
        let mut child_count: std::collections::HashMap<String, usize> =
            std::collections::HashMap::new();
        child_count.insert(host_peer_id.to_string(), 0);
        for edge in edges.iter() {
            child_count.insert(edge.to_peer_id.clone(), 0);
        }
        for edge in edges.iter() {
            *child_count.entry(edge.from_peer_id.clone()).or_insert(0) += 1;
        }

        // Find the node with the fewest children below the limit
        let best_parent = child_count
            .iter()
            .filter(|(_, &count)| count < self.max_children_per_node)
            .min_by_key(|(id, &count)| {
                // Prefer fewer children; break ties by preferring the host
                // (to keep the tree shallow)
                let depth = self.get_depth(&edges, id, host_peer_id);
                (depth, count)
            })
            .map(|(id, _)| id.clone());

        if let Some(ref parent_id) = best_parent {
            edges.push(TopologyEdge {
                from_peer_id: parent_id.clone(),
                to_peer_id: new_peer_id.to_string(),
                rtt_ms: None,
                status: EdgeStatus::Connecting,
            });
        }

        best_parent
    }

    /// Returns the depth of a node in the tree (0 = host).
    fn get_depth(&self, edges: &[TopologyEdge], node_id: &str, host_peer_id: &str) -> usize {
        if node_id == host_peer_id {
            return 0;
        }

        let mut depth = 0;
        let mut current = node_id.to_string();

        for _ in 0..100 {
            // Safety limit to prevent infinite loops
            if let Some(edge) = edges.iter().find(|e| e.to_peer_id == current) {
                depth += 1;
                current = edge.from_peer_id.clone();
                if current == host_peer_id {
                    return depth;
                }
            } else {
                break;
            }
        }
        depth
    }

    /// Removes a node from the topology and re-parents its children to its parent.
    /// This provides self-healing when a relay node disconnects.
    ///
    /// Returns the list of orphaned peer IDs that were re-parented.
    pub fn remove_node(&self, room_id: &str, peer_id: &str) -> Vec<String> {
        let mut edges = match self.edges.get_mut(room_id) {
            Some(e) => e,
            None => return Vec::new(),
        };

        // Find the parent of the disconnected node
        let parent_id = edges
            .iter()
            .find(|e| e.to_peer_id == peer_id)
            .map(|e| e.from_peer_id.clone());

        // Find all children of the disconnected node
        let children: Vec<String> = edges
            .iter()
            .filter(|e| e.from_peer_id == peer_id)
            .map(|e| e.to_peer_id.clone())
            .collect();

        // Remove all edges involving the disconnected node
        edges.retain(|e| e.from_peer_id != peer_id && e.to_peer_id != peer_id);

        // Re-parent children to the disconnected node's parent
        if let Some(parent) = parent_id {
            for child in &children {
                edges.push(TopologyEdge {
                    from_peer_id: parent.clone(),
                    to_peer_id: child.clone(),
                    rtt_ms: None,
                    status: EdgeStatus::Connecting,
                });
            }
        }

        children
    }

    /// Returns the full topology tree for a room.
    pub fn get_tree(&self, room_id: &str) -> Vec<TopologyEdge> {
        self.edges
            .get(room_id)
            .map(|e| e.value().clone())
            .unwrap_or_default()
    }

    /// Updates the RTT measurement between two peers.
    pub fn update_rtt(&self, room_id: &str, from: &str, to: &str, rtt_ms: f64) -> bool {
        if let Some(mut edges) = self.edges.get_mut(room_id) {
            if let Some(edge) = edges
                .iter_mut()
                .find(|e| e.from_peer_id == from && e.to_peer_id == to)
            {
                edge.rtt_ms = Some(rtt_ms);
                edge.status = if rtt_ms < 50.0 {
                    EdgeStatus::Synced
                } else if rtt_ms < 150.0 {
                    EdgeStatus::Degraded
                } else {
                    EdgeStatus::Disconnected
                };
                return true;
            }
        }
        false
    }

    /// Updates the status of an edge between two peers.
    pub fn update_edge_status(
        &self,
        room_id: &str,
        from: &str,
        to: &str,
        status: EdgeStatus,
    ) -> bool {
        if let Some(mut edges) = self.edges.get_mut(room_id) {
            if let Some(edge) = edges
                .iter_mut()
                .find(|e| e.from_peer_id == from && e.to_peer_id == to)
            {
                edge.status = status;
                return true;
            }
        }
        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_assign_parent_first_peer_gets_host() {
        let topo = TopologyManager::new(3);
        topo.init_room("room-1");

        let parent = topo.assign_parent("room-1", "peer-1", "host", &["peer-1".into()]);
        assert_eq!(parent, Some("host".to_string()));
    }

    #[test]
    fn test_assign_parent_balances_tree() {
        let topo = TopologyManager::new(2);
        topo.init_room("room-1");

        let all_peers: Vec<String> =
            vec!["p1", "p2", "p3", "p4", "p5"]
                .into_iter()
                .map(String::from)
                .collect();

        // p1 -> host
        let parent = topo.assign_parent("room-1", "p1", "host", &all_peers);
        assert_eq!(parent, Some("host".to_string()));

        // p2 -> host (host has 1 child, still under limit of 2)
        let parent = topo.assign_parent("room-1", "p2", "host", &all_peers);
        assert_eq!(parent, Some("host".to_string()));

        // p3 -> should go to p1 or p2 (host is full at 2)
        let parent = topo.assign_parent("room-1", "p3", "host", &all_peers);
        assert!(parent == Some("p1".to_string()) || parent == Some("p2".to_string()));
    }

    #[test]
    fn test_remove_node_reparents_children() {
        let topo = TopologyManager::new(1);
        topo.init_room("room-1");

        let peers: Vec<String> = vec!["p1", "p2", "p3"]
            .into_iter()
            .map(String::from)
            .collect();

        // Build: host -> p1 -> p2 -> p3 (since limit is 1)
        topo.assign_parent("room-1", "p1", "host", &peers);
        topo.assign_parent("room-1", "p2", "host", &peers);
        topo.assign_parent("room-1", "p3", "host", &peers);

        // Remove p1 — its child (p2) should be re-parented to host (p1's parent)
        let orphans = topo.remove_node("room-1", "p1");
        assert_eq!(orphans, vec!["p2".to_string()]);

        let tree = topo.get_tree("room-1");
        // p1 should have no edges remaining
        assert!(tree.iter().all(|e| e.from_peer_id != "p1" && e.to_peer_id != "p1"));

        // p2 should be re-parented to host, and p3 should still be connected to p2
        assert!(tree.iter().any(|e| e.from_peer_id == "host" && e.to_peer_id == "p2"));
        assert!(tree.iter().any(|e| e.from_peer_id == "p2" && e.to_peer_id == "p3"));
        assert_eq!(tree.len(), 2);
    }

    #[test]
    fn test_update_rtt() {
        let topo = TopologyManager::new(3);
        topo.init_room("room-1");

        topo.assign_parent("room-1", "p1", "host", &["p1".into()]);

        assert!(topo.update_rtt("room-1", "host", "p1", 12.5));

        let tree = topo.get_tree("room-1");
        let edge = tree.iter().find(|e| e.to_peer_id == "p1").unwrap();
        assert_eq!(edge.rtt_ms, Some(12.5));
        assert_eq!(edge.status, EdgeStatus::Synced);
    }

    #[test]
    fn test_rtt_determines_status() {
        let topo = TopologyManager::new(3);
        topo.init_room("room-1");

        topo.assign_parent("room-1", "p1", "host", &["p1".into()]);

        topo.update_rtt("room-1", "host", "p1", 100.0);
        let tree = topo.get_tree("room-1");
        let edge = tree.iter().find(|e| e.to_peer_id == "p1").unwrap();
        assert_eq!(edge.status, EdgeStatus::Degraded);

        topo.update_rtt("room-1", "host", "p1", 200.0);
        let tree = topo.get_tree("room-1");
        let edge = tree.iter().find(|e| e.to_peer_id == "p1").unwrap();
        assert_eq!(edge.status, EdgeStatus::Disconnected);
    }

    #[test]
    fn test_remove_room() {
        let topo = TopologyManager::new(3);
        topo.init_room("room-1");
        topo.assign_parent("room-1", "p1", "host", &["p1".into()]);
        topo.remove_room("room-1");
        assert!(topo.get_tree("room-1").is_empty());
    }
}
