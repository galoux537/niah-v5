import { useState, useEffect, useRef } from 'react';

// 🎵 Hook para gerenciar áudios armazenados no banco de dados
export function useAudio(callId: string | null) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioInfo, setAudioInfo] = useState<{
    has_audio: boolean;
    content_type: string | null;
    size_mb: number | null;
    original_name: string | null;
    audio_url: string | null;
  } | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar elemento de áudio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      
      const audio = audioRef.current;
      
      // Event listeners
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        setIsLoading(false);
      };
      
      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      
      const handleError = () => {
        setIsLoading(false);
        setError('❌ Não foi possível carregar o áudio');
      };
      
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.pause();
        audio.src = '';
      };
    }
  }, []);

  // Carregar informações do áudio quando callId mudar
  useEffect(() => {
    if (!callId) {
      setAudioInfo(null);
      setError(null);
      return;
    }

    const loadAudioInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Buscar informações do áudio
        const response = await fetch(`http://localhost:3001/api/v1/audio/${callId}/info`);
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const info = await response.json();
        setAudioInfo(info);
        
        // Se tem áudio, configurar o player
        if (info.has_audio && audioRef.current) {
          audioRef.current.src = `http://localhost:3001/api/v1/audio/${callId}`;
        } else {
          setError('📭 Áudio não disponível para esta ligação');
        }
        
      } catch (err) {
        console.error('Erro ao carregar informações do áudio:', err);
        setError('❌ Erro ao carregar áudio');
        setIsLoading(false);
      }
    };

    loadAudioInfo();
  }, [callId]);

  // Funções de controle
  const togglePlayPause = async () => {
    if (!audioRef.current || error || !audioInfo?.has_audio) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Erro ao reproduzir áudio:', err);
      setError('❌ Erro ao reproduzir áudio');
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || !duration) return;
    
    const newTime = (parseFloat(event.target.value) / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const newVolume = parseFloat(event.target.value) / 100;
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return duration ? (currentTime / duration) * 100 : 0;
  };

  return {
    // Estados
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    error,
    audioInfo,
    
    // Funções
    togglePlayPause,
    handleSeek,
    handleVolumeChange,
    formatTime,
    getProgressPercentage,
    
    // Dados úteis
    hasAudio: audioInfo?.has_audio || false,
    audioUrl: audioInfo?.audio_url || null,
    originalName: audioInfo?.original_name || null,
    contentType: audioInfo?.content_type || null,
    sizeMB: audioInfo?.size_mb || null
  };
} 
