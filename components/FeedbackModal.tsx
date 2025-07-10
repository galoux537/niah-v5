import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, X, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Feedback {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (feedback: Omit<Feedback, 'id'>) => void;
  feedback?: Feedback | null;
}

const colorOptions = [
  { value: '#E67C0B', label: 'Laranja', name: 'orange' },
  { value: '#FFBD00', label: 'Amarelo Escuro', name: 'yellow-dark' },
  { value: '#28259B', label: 'Azul Escuro', name: 'blue-dark' },
  { value: '#1E1F25', label: 'Preto', name: 'black' },
  { value: '#E60B42', label: 'Vermelho', name: 'red' },
  { value: '#5CB868', label: 'Verde', name: 'green' },
  { value: '#FFBB3A', label: 'Amarelo', name: 'yellow' },
  { value: '#3057F2', label: 'Azul', name: 'blue' },
  { value: '#8B5CF6', label: 'Roxo', name: 'purple' },
  { value: '#EC4899', label: 'Rosa', name: 'pink' },
];

export function FeedbackModal({ isOpen, onClose, onSave, feedback }: FeedbackModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    color: '#E67C0B',
    description: '',
    keywords: [] as string[],
    idealPhrase: ''
  });

  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    if (feedback) {
      setFormData({
        name: feedback.name,
        color: feedback.color,
        description: feedback.description,
        keywords: [],
        idealPhrase: ''
      });
    } else {
      setFormData({
        name: '',
        color: '#E67C0B',
        description: '',
        keywords: [],
        idealPhrase: ''
      });
    }
  }, [feedback, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Nome e descrição são obrigatórios');
      return;
    }

    onSave({
      name: formData.name.trim(),
      color: formData.color,
      description: formData.description.trim()
    });
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, newKeyword.trim()]
      });
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keyword)
    });
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div 
        className="flex-1 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="w-[600px] bg-[#f9fafc] border-l border-[#e1e9f4] shadow-xl overflow-y-auto rounded-tl-[16px] rounded-bl-[16px]">
        <div className="p-6 space-y-6">
          {/* Header com botão de voltar */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0 rounded-full border border-[#e1e9f4] bg-white hover:bg-[#f9fafc]"
            >
              <ArrowLeft className="h-4 w-4 text-[#373753]" />
            </Button>
            <h1 className="text-[#373753] text-3xl font-semibold">
              Feedback
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados do Feedback */}
            <Card>
              <CardHeader className="border-b border-[#e1e9f4]">
                <CardTitle className="text-[#373753] text-lg font-medium px-2">
                  Dados do Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[#373753] text-base block">
                      Nome <span className="text-[#f23f2c]">*</span>
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Abordagem"
                      className="h-10 rounded-[10px] border-[#e1e9f4]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[#373753] text-base block">
                      Cor <span className="text-[#f23f2c]">*</span>
                    </label>
                    <Select
                      value={formData.color}
                      onValueChange={(value) => setFormData({ ...formData, color: value })}
                    >
                      <SelectTrigger className="h-10 rounded-[10px] border-[#e1e9f4]">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: formData.color }}
                          />
                          <ChevronDown className="h-6 w-6 text-[#677c92] ml-auto" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: color.value }}
                              />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[#373753] text-base block">
                    Descrição <span className="text-[#f23f2c]">*</span>
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Termos de saudação"
                    className="min-h-[80px] resize-none rounded-[10px] border-[#e1e9f4]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Complementos da IA */}
            <Card>
              <CardHeader className="border-b border-[#e1e9f4]">
                <CardTitle className="text-[#373753] text-lg font-medium px-2">
                  Complementos da IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <label className="text-[#373753] text-base block">
                    Palavra chave
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyPress={handleKeywordKeyPress}
                        placeholder="Digite uma palavra chave"
                        className="flex-1 h-10 rounded-[10px] border-[#e1e9f4]"
                      />
                      <Button
                        type="button"
                        onClick={handleAddKeyword}
                        variant="outline"
                        disabled={!newKeyword.trim()}
                        className="rounded-[10px]"
                      >
                        Adicionar
                      </Button>
                    </div>
                    
                    {formData.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-2 bg-white rounded-[10px] border border-[#e1e9f4]">
                        {formData.keywords.map((keyword, index) => (
                          <div
                            key={index}
                            className="bg-[#e1e9f4] text-[#1a4a89] px-2 py-1 rounded-md text-sm flex items-center gap-2"
                          >
                            {keyword}
                            <button
                              type="button"
                              onClick={() => handleRemoveKeyword(keyword)}
                              className="text-[#1a4a89] hover:text-[#dc2f1c] transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[#373753] text-base block">
                    Frase ideal
                  </label>
                  <Textarea
                    value={formData.idealPhrase}
                    onChange={(e) => setFormData({ ...formData, idealPhrase: e.target.value })}
                    className="min-h-[80px] resize-none rounded-[10px] border-[#e1e9f4]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Botões */}
            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              <Button
                type="submit"
                className="w-full bg-[#3057f2] hover:bg-[#2545d9] h-10 rounded-[10px]"
              >
                Criar
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="w-full text-[#677c92] hover:text-[#373753] h-8 rounded-[10px]"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
