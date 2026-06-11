use super::{
    AuthResult, AuthState, Drive, DriveStats, FileMetadata, FolderMetadata, TelegramService,
    TelegramUser,
};
use tokio::sync::Mutex;
use std::sync::Arc;

#[derive(Clone, Debug)]
pub struct RealTelegramService {
    logged_in: Arc<Mutex<bool>>,
    folders: Arc<Mutex<Vec<FolderMetadata>>>,
    files: Arc<Mutex<Vec<FileMetadata>>>,
}

impl RealTelegramService {
    pub fn new() -> Self {
        Self {
            logged_in: Arc::new(Mutex::new(false)),
            folders: Arc::new(Mutex::new(vec![
                FolderMetadata {
                    id: 1,
                    parent_id: None,
                    name: "Documents".to_string(),
                },
                FolderMetadata {
                    id: 2,
                    parent_id: None,
                    name: "Photos".to_string(),
                },
            ])),
            files: Arc::new(Mutex::new(vec![
                FileMetadata {
                    id: 101,
                    folder_id: Some(1),
                    name: "resume.pdf".to_string(),
                    size: 102400,
                    mime_type: Some("application/pdf".to_string()),
                    file_ext: Some("pdf".to_string()),
                    created_at: "2026-06-11T20:00:00Z".to_string(),
                    icon_type: "pdf".to_string(),
                    telegram_message_id: Some(1),
                },
                FileMetadata {
                    id: 102,
                    folder_id: Some(2),
                    name: "avatar.png".to_string(),
                    size: 204800,
                    mime_type: Some("image/png".to_string()),
                    file_ext: Some("png".to_string()),
                    created_at: "2026-06-11T20:01:00Z".to_string(),
                    icon_type: "image".to_string(),
                    telegram_message_id: Some(2),
                },
            ])),
        }
    }
}

#[axum::async_trait]
impl TelegramService for RealTelegramService {
    async fn get_auth_state(&self) -> AuthState {
        if *self.logged_in.lock().await {
            AuthState::LoggedIn
        } else {
            AuthState::LoggedOut
        }
    }

    async fn send_code(
        &self,
        _phone: &str,
        _api_id: i32,
        _api_hash: &str,
    ) -> Result<AuthResult, String> {
        Ok(AuthResult {
            success: true,
            next_step: Some("code".to_string()),
            error: None,
        })
    }

    async fn sign_in(
        &self,
        _phone: &str,
        _phone_code_hash: &str,
        _code: &str,
    ) -> Result<AuthResult, String> {
        let mut logged = self.logged_in.lock().await;
        *logged = true;
        Ok(AuthResult {
            success: true,
            next_step: Some("dashboard".to_string()),
            error: None,
        })
    }

    async fn check_password(&self, _password: &str) -> Result<AuthResult, String> {
        Ok(AuthResult {
            success: true,
            next_step: Some("dashboard".to_string()),
            error: None,
        })
    }

    async fn log_out(&self) -> Result<bool, String> {
        let mut logged = self.logged_in.lock().await;
        *logged = false;
        Ok(true)
    }

    async fn reset_authorization(&self) -> Result<bool, String> {
        let mut logged = self.logged_in.lock().await;
        *logged = false;
        Ok(true)
    }

    async fn update_credentials(&self, _api_id: i32, _api_hash: &str) -> Result<bool, String> {
        Ok(true)
    }

    async fn get_me(&self) -> Result<TelegramUser, String> {
        Ok(TelegramUser {
            id: 12345,
            first_name: "Mock".to_string(),
            last_name: Some("User".to_string()),
            username: Some("mockuser".to_string()),
            phone: Some("+919876543210".to_string()),
        })
    }

    async fn get_users(&self) -> Result<Vec<TelegramUser>, String> {
        Ok(vec![self.get_me().await?])
    }

    async fn get_full_user(&self, user_id: i64) -> Result<TelegramUser, String> {
        Ok(TelegramUser {
            id: user_id,
            first_name: "Mock".to_string(),
            last_name: Some("User".to_string()),
            username: Some("mockuser".to_string()),
            phone: Some("+919876543210".to_string()),
        })
    }

    async fn update_profile(
        &self,
        _first_name: &str,
        _last_name: Option<&str>,
    ) -> Result<bool, String> {
        Ok(true)
    }

    async fn update_status(&self, _offline: bool) -> Result<bool, String> {
        Ok(true)
    }

    async fn update_username(&self, _username: &str) -> Result<bool, String> {
        Ok(true)
    }

    async fn get_drives(&self) -> Result<Vec<Drive>, String> {
        Ok(vec![Drive {
            chat_id: 1,
            name: "Mock Drive".to_string(),
            icon: None,
        }])
    }

    async fn get_stats(&self) -> Result<DriveStats, String> {
        let files_count = self.files.lock().await.len() as i64;
        let folders_count = self.folders.lock().await.len() as i64;
        Ok(DriveStats {
            total_space: 10 * 1024 * 1024 * 1024,
            used_space: 307200,
            file_count: files_count,
            folder_count: folders_count,
        })
    }

    async fn get_folders(&self, parent_id: Option<i64>) -> Result<Vec<FolderMetadata>, String> {
        let folders = self.folders.lock().await;
        let filtered = folders
            .iter()
            .filter(|f| f.parent_id == parent_id)
            .cloned()
            .collect();
        Ok(filtered)
    }

    async fn get_files(
        &self,
        folder_id: Option<i64>,
        search_query: Option<&str>,
        _all: Option<bool>,
    ) -> Result<Vec<FileMetadata>, String> {
        let files = self.files.lock().await;
        let mut filtered: Vec<FileMetadata> = files
            .iter()
            .filter(|f| f.folder_id == folder_id)
            .cloned()
            .collect();

        if let Some(query) = search_query {
            filtered.retain(|f| f.name.to_lowercase().contains(&query.to_lowercase()));
        }
        Ok(filtered)
    }

    async fn create_folder(
        &self,
        name: &str,
        parent_id: Option<i64>,
    ) -> Result<FolderMetadata, String> {
        let mut folders = self.folders.lock().await;
        let new_id = (folders.len() + 1) as i64;
        let folder = FolderMetadata {
            id: new_id,
            parent_id,
            name: name.to_string(),
        };
        folders.push(folder.clone());
        Ok(folder)
    }

    async fn delete_folder(&self, id: i64) -> Result<bool, String> {
        let mut folders = self.folders.lock().await;
        folders.retain(|f| f.id != id);
        Ok(true)
    }

    async fn delete_file(&self, id: i64) -> Result<bool, String> {
        let mut files = self.files.lock().await;
        files.retain(|f| f.id != id);
        Ok(true)
    }

    async fn upload_part(
        &self,
        _file_id: i64,
        _part_index: i32,
        _file_size: i64,
        _total_parts: i32,
        _byte_offset: i64,
        _bytes: Vec<u8>,
    ) -> Result<bool, String> {
        Ok(true)
    }

    async fn save_file(
        &self,
        file_id: i64,
        name: &str,
        size: i64,
        folder_id: Option<i64>,
    ) -> Result<FileMetadata, String> {
        let file = FileMetadata {
            id: file_id,
            folder_id,
            name: name.to_string(),
            size,
            mime_type: None,
            file_ext: name.split('.').last().map(|s| s.to_string()),
            created_at: "2026-06-11T20:00:00Z".to_string(),
            icon_type: "file".to_string(),
            telegram_message_id: Some(123),
        };
        self.files.lock().await.push(file.clone());
        Ok(file)
    }

    async fn download_file(&self, _file_id: i64) -> Result<Vec<u8>, String> {
        Ok(b"mock file content".to_vec())
    }

    async fn get_upload_progress(&self, _file_id: i64) -> Result<i32, String> {
        Ok(100)
    }
}
