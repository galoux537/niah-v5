import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';

interface AudioInfo {
  call_id: string;
  has_audio: boolean;
  storage_url: string | null;
  storage_path: string | null;
  file_name: string | null;
  file_size: number | null;
  public_url: string | null;
}

export function useSupabaseAudio(callId: string | null) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioInfo, setAudioInfo] = useState<AudioInfo | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar elemento de áudio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      
      const audio = audioRef.current;
      
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
        
        console.log('🔍 Buscando informações do áudio para call ID:', callId);
        
        // Buscar informações do áudio no banco via função SQL
        const { data, error } = await supabase
          .rpc('get_call_audio_info', { call_id_param: callId });
        
        if (error) {
          console.error('❌ Erro na função SQL:', error);
          throw new Error(`Erro ao buscar áudio: ${error.message}`);
        }
        
        if (!data || data.length === 0) {
          console.log('📭 Nenhuma informação de áudio encontrada');
          setError('📭 Informações do áudio não encontradas');
          setIsLoading(false);
          return;
        }
        
        const info = data[0];
        console.log('📄 Informações do áudio:', info);
        setAudioInfo(info);
        
        // Se tem áudio, configurar o player
        if (info.has_audio && info.public_url && audioRef.current) {
          console.log('🎵 Configurando player com URL:', info.public_url);
          audioRef.current.src = info.public_url;
        } else if (info.has_audio && info.storage_path) {
          // Gerar URL diretamente via Supabase Storage
          console.log('🔗 Gerando URL para path:', info.storage_path);
          const { data: urlData } = supabase.storage
            .from('call-audios')
            .getPublicUrl(info.storage_path);
          
          if (urlData?.publicUrl && audioRef.current) {
            console.log('✅ URL gerada:', urlData.publicUrl);
            audioRef.current.src = urlData.publicUrl;
          } else {
            console.error('❌ Falha ao gerar URL');
            setError('❌ Não foi possível gerar URL do áudio');
          }
        } else {
          console.log('📭 Áudio não disponível');
          setError('📭 Áudio não disponível para esta ligação');
        }
        
        setIsLoading(false);
        
      } catch (err) {
        console.error('❌ Erro ao carregar informações do áudio:', err);
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

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return null;
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  const cleanFileName = (fileName: string | null) => {
    if (!fileName) return 'Áudio da ligação';
    
    // Remover padrões UUID longos e códigos técnicos
    let cleanName = fileName
      // Remover UUIDs no formato xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '')
      // Remover timestamps no formato _2025_07_01T14_37_10_070Z
      .replace(/_\d{4}_\d{2}_\d{2}T\d{2}_\d{2}_\d{2}_\d{3}Z/gi, '')
      // Remover múltiplos underscores e hífens
      .replace(/[_-]+/g, '_')
      // Remover underscores no início e fim
      .replace(/^_+|_+$/g, '')
      // Se começar com números e underscore, manter só a extensão
      .replace(/^\d+_*/, '');
    
    // Se sobrou apenas a extensão ou string muito pequena, usar nome genérico
    if (cleanName.length < 4 || cleanName.match(/^\.[a-z]+$/)) {
      return 'Áudio da ligação';
    }
    
    // Capitalizar primeira letra se necessário
    if (cleanName && !cleanName.match(/^[A-Z]/)) {
      cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    }
    
    return cleanName || 'Áudio da ligação';
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
    
    // Referência do elemento de áudio
    audioRef,
    
    // Dados úteis
    hasAudio: audioInfo?.has_audio || false,
    audioUrl: audioInfo?.public_url || null,
    fileName: cleanFileName(audioInfo?.file_name || null),
    fileSize: formatFileSize(audioInfo?.file_size || null),
    storagePath: audioInfo?.storage_path || null
  };
} 
