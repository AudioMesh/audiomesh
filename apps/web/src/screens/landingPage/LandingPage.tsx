import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { TitleBoxContainer } from '@components';
import { BEETHOVEN_MELODY, INITIAL_NODES } from './Const';
import { Node } from './types';
import HeroSection from './components/HeroSection';
import DiagnosticsTerminal from './components/DiagnosticsTerminal';
import HowItWorksSection from './components/HowItWorksSection';
import FeaturesSection from './components/FeaturesSection';

export const LandingPage = () => {
  const { t } = useTranslation();

  const [nodes, setNodes] = React.useState<Node[]>(INITIAL_NODES);
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(
    null,
  );
  const [isCalibrating, setIsCalibrating] = React.useState(false);
  const [testToneActive, setTestToneActive] = React.useState(false);

  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const oscillatorRef = React.useRef<OscillatorNode | null>(null);
  const gainNodeRef = React.useRef<GainNode | null>(null);
  const melodyIntervalRef = React.useRef<any>(null);

  const startAudio = () => {
    if (typeof window === 'undefined') return;
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Soft triangle wave provides a warm, music-box-like melody sound
      osc.type = 'triangle';

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = gainNode;

      const playPhrase = (startTime: number) => {
        let time = startTime;
        BEETHOVEN_MELODY.forEach((note) => {
          const gap = note.g ?? 0.05;
          // Update oscillator frequency at note start time
          osc.frequency.setValueAtTime(note.f, time);
          // Apply a gentle ADSR-like volume envelope for each note
          gainNode.gain.setValueAtTime(0, time);
          gainNode.gain.linearRampToValueAtTime(0.08, time + 0.03);
          gainNode.gain.setValueAtTime(0.08, time + note.d - 0.03);
          gainNode.gain.linearRampToValueAtTime(0, time + note.d);
          time += note.d + gap; // note duration plus gap
        });
      };

      // Calculate the total duration of the phrase dynamically to loop perfectly
      const phraseDuration = BEETHOVEN_MELODY.reduce(
        (acc, note) => acc + note.d + (note.g ?? 0.05),
        0,
      );

      // Play the first phrase immediately
      playPhrase(ctx.currentTime + 0.1);

      // Loop the phrase
      const intervalId = setInterval(() => {
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
          playPhrase(audioCtxRef.current.currentTime + 0.1);
        } else {
          clearInterval(intervalId);
        }
      }, phraseDuration * 1000);

      melodyIntervalRef.current = intervalId;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to start audio context:', e);
    }
  };

  const stopAudio = () => {
    try {
      if (melodyIntervalRef.current) {
        clearInterval(melodyIntervalRef.current);
        melodyIntervalRef.current = null;
      }

      const ctx = audioCtxRef.current;
      const osc = oscillatorRef.current;
      const gainNode = gainNodeRef.current;

      if (ctx && gainNode) {
        // Smoothly fade out the current note
        gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

        if (osc) osc.stop(ctx.currentTime + 0.2);

        setTimeout(() => {
          try {
            if (osc) osc.disconnect();
            gainNode.disconnect();
            if (ctx.state !== 'closed') {
              ctx.close();
            }
          } catch (err) {}
        }, 250);
      } else {
        if (osc) {
          try {
            osc.stop();
            osc.disconnect();
          } catch (err) {}
        }
        if (gainNode) {
          try {
            gainNode.disconnect();
          } catch (err) {}
        }
        if (ctx && ctx.state !== 'closed') {
          try {
            ctx.close();
          } catch (err) {}
        }
      }

      oscillatorRef.current = null;
      gainNodeRef.current = null;
      audioCtxRef.current = null;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to stop audio context:', e);
    }
  };

  React.useEffect(() => {
    if (testToneActive) {
      startAudio();
    } else {
      stopAudio();
    }
    return () => {
      stopAudio();
    };
  }, [testToneActive]);

  const [terminalLogs, setTerminalLogs] = React.useState<string[]>([]);

  React.useEffect(() => {
    setTerminalLogs([
      t('LandingPage.logDaemonInit'),
      t('LandingPage.logDualSync'),
      t('LandingPage.logReady'),
    ]);
  }, [t]);

  const terminalRef = React.useRef<HTMLDivElement>(null);

  const addLog = (log: string) => {
    setTerminalLogs((prev) => [...prev.slice(-15), log]);
  };

  React.useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  const handleUpdateNode = (id: string, updates: Partial<Node>) => {
    const node = nodes.find((n) => n.id === id);
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    );
    if (!node) return;
    const name = t(
      `LandingPage.nodeName${id.charAt(0).toUpperCase() + id.slice(1)}`,
      { defaultValue: node.name },
    );
    if (updates.volume !== undefined) {
      addLog(
        t('LandingPage.logVolumeUpdate', { name, volume: updates.volume }),
      );
    }
    if (updates.latency !== undefined) {
      const sign = updates.latency > 0 ? '+' : '';
      addLog(
        t('LandingPage.logLatencyCalibrate', {
          name,
          sign,
          latency: updates.latency,
        }),
      );
    }
    if (updates.status !== undefined) {
      addLog(
        t('LandingPage.logStatusSet', {
          name,
          status: updates.status.toUpperCase(),
        }),
      );
    }
  };

  const runCalibration = () => {
    if (isCalibrating) return;
    setIsCalibrating(true);
    addLog(t('LandingPage.logCalibrateStart'));

    // Step-by-step sequential calibration of each node
    const nodeOrder = ['macbook', 'ipad', 'android', 'speaker', 'iphone'];
    const rtts = { macbook: 4, ipad: 12, android: 8, speaker: 15, iphone: 9 };

    nodeOrder.forEach((nodeId, index) => {
      setTimeout(
        () => {
          const node = nodes.find((n) => n.id === nodeId);
          const name = t(
            `LandingPage.nodeName${nodeId.charAt(0).toUpperCase() + nodeId.slice(1)}`,
            { defaultValue: node?.name || nodeId },
          );
          const rtt = rtts[nodeId as keyof typeof rtts];

          setNodes((prev) =>
            prev.map((n) =>
              n.id === nodeId ? { ...n, latency: 0, status: 'active' } : n,
            ),
          );

          addLog(t('LandingPage.logCalibratePing', { name, rtt }));

          if (index === nodeOrder.length - 1) {
            setTimeout(() => {
              addLog(t('LandingPage.logCalibrateSuccess'));
              setIsCalibrating(false);
            }, 600);
          }
        },
        (index + 1) * 600,
      );
    });
  };

  const toggleTestTone = () => {
    setTestToneActive((prev) => {
      const next = !prev;
      addLog(
        next
          ? t('LandingPage.logAudioInject')
          : t('LandingPage.logAudioDisable'),
      );
      return next;
    });
  };

  React.useEffect(() => {
    const supportsScrollTimeline =
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('(animation-timeline: view()) and (animation-range: entry)');

    if (
      !supportsScrollTimeline &&
      typeof IntersectionObserver !== 'undefined'
    ) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal-visible');
            }
          });
        },
        {
          threshold: 0.15,
          rootMargin: '0px 0px -55px 0px',
        },
      );

      const elements = document.querySelectorAll('.reveal-up, .reveal-scale');
      elements.forEach((el) => observer.observe(el));

      return () => {
        elements.forEach((el) => observer.unobserve(el));
      };
    }
  }, []);

  return (
    <TitleBoxContainer
      title={
        t('LandingPage.heroTitlePrefix') + ' ' + t('LandingPage.heroTitleSpan')
      }
      icon="app"
      display="flex"
      flexDir="column"
      width="100%"
    >
      {/* Hero Header Area (Wraps Diagnostics Terminal) */}
      <HeroSection>
        <DiagnosticsTerminal
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onUpdateNode={handleUpdateNode}
          isCalibrating={isCalibrating}
          testToneActive={testToneActive}
          runCalibration={runCalibration}
          toggleTestTone={toggleTestTone}
          terminalLogs={terminalLogs}
          terminalRef={terminalRef}
        />
      </HeroSection>

      {/* Timeline: How It Works Section */}
      <HowItWorksSection />

      {/* Features Grid Area */}
      <FeaturesSection />
    </TitleBoxContainer>
  );
};

export default LandingPage;
