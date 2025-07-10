import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';

interface Criterion {
  name: string;
  score: number;
  color?: string;
}

interface CriteriaChartProps {
  criteria: Criterion[];
  title?: string;
}

export function CriteriaChart({ criteria, title = "Critérios" }: CriteriaChartProps) {
  // Mostrar gráfico apenas para 3 a 15 critérios (inclusive);
  // fora desse intervalo, forçamos listagem (insights)
  const isGraphAllowed = criteria.length >= 3 && criteria.length <= 15;
  const defaultTab = isGraphAllowed ? 'graph' : 'insights';
  const [activeTab, setActiveTab] = useState<'graph' | 'insights'>(defaultTab);

  // Atualizar aba quando quantidade de critérios muda
  React.useEffect(() => {
    if (!isGraphAllowed) {
      setActiveTab('insights');
    }
  }, [criteria.length, isGraphAllowed]);

  // Generate dynamic radar chart
  const generateRadarChart = () => {
    if (criteria.length === 0) return null;

    const centerX = 128;
    const centerY = 96;
    const maxRadius = 64;
    const angleStep = (2 * Math.PI) / criteria.length;

    // Background circles
    const circles = [
      { radius: maxRadius * 0.25, stroke: '#E1E9F4' },
      { radius: maxRadius * 0.5, stroke: '#E1E9F4' },
      { radius: maxRadius * 0.75, stroke: '#E1E9F4' },
      { radius: maxRadius, stroke: '#E1E9F4' }
    ];

    // Generate grid lines
    const gridLines = criteria.map((_, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const endX = centerX + Math.cos(angle) * maxRadius;
      const endY = centerY + Math.sin(angle) * maxRadius;
      
      return {
        x1: centerX,
        y1: centerY,
        x2: endX,
        y2: endY
      };
    });

    // Generate data points
    const dataPoints = criteria.map((criterion, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const radius = (criterion.score / 10) * maxRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      return { x, y, criterion };
    });

    // Generate polygon path
    const pathData = dataPoints.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z';

    // Generate labels
    const labels = criteria.map((criterion, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const labelRadius = maxRadius + 16;
      const x = centerX + Math.cos(angle) * labelRadius;
      const y = centerY + Math.sin(angle) * labelRadius;
      
      return {
        name: criterion.name,
        x,
        y,
        textAnchor: x < centerX ? 'end' : x > centerX ? 'start' : 'middle',
        dominantBaseline: y < centerY ? 'auto' : y > centerY ? 'hanging' : 'middle'
      };
    });

    // Get score color based on value
    const getScoreColor = (score: number) => {
      if (score >= 7) return 'text-[#059669]'; // Verde para notas 7.0-10.0
      if (score >= 4) return 'text-[#d97706]'; // Amarelo para notas 4.0-6.9
      return 'text-[#dc2626]'; // Vermelho para notas 0.0-3.9
    };

    return (
      <div className="flex items-center justify-center h-full relative">
        <TooltipProvider>
          <svg width="256" height="192" viewBox="0 0 256 192" className="overflow-visible">
            {/* Background circles */}
            {circles.map((circle, index) => (
              <circle
                key={`circle-${index}`}
                cx={centerX}
                cy={centerY}
                r={circle.radius}
                fill="none"
                stroke={circle.stroke}
                strokeWidth="1"
              />
            ))}
            
            {/* Grid lines */}
            {gridLines.map((line, index) => (
              <line
                key={`line-${index}`}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#E1E9F4"
                strokeWidth="1"
              />
            ))}
            
            {/* Data polygon */}
            <path
              d={pathData}
              fill="#5CB868"
              fillOpacity="0.3"
              stroke="#5CB868"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            
            {/* Data points with tooltips */}
            {dataPoints.map((point, index) => (
              <g key={`point-${index}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="6"
                      fill="#5CB868"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="radar-point"
                      style={{ 
                        filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))',
                        cursor: 'help'
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    sideOffset={12}
                    className="bg-white border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.1)] rounded-lg p-4 max-w-xs z-[9999]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#373753] text-sm font-medium">
                        {point.criterion.name}:
                      </span>
                      <div className="flex items-center gap-1">
                        <span 
                          className={getScoreColor(point.criterion.score)}
                        >
                          {point.criterion.score.toFixed(1)}
                        </span>
                        <span className="text-[#677c92] text-sm">/10</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </g>
            ))}
            
            {/* Labels */}
            {labels.map((label, index) => (
              <text
                key={`label-${index}`}
                x={label.x}
                y={label.y}
                textAnchor={label.textAnchor}
                dominantBaseline={label.dominantBaseline}
                className="text-xs text-[#677c92] uppercase pointer-events-none"
                fill="#677c92"
              >
                {label.name}
              </text>
            ))}
          </svg>
        </TooltipProvider>
      </div>
    );
  };

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-[#059669]'; // Verde para notas 7.0-10.0
    if (score >= 4) return 'text-[#d97706]'; // Amarelo para notas 4.0-6.9
    return 'text-[#dc2626]'; // Vermelho para notas 0.0-3.9
  };

  // Get category based on score
  const getCategory = (score: number) => {
    if (score >= 7) return 'Mandando bem'; // Verde para notas 7.0-10.0
    if (score >= 4) return 'Pode melhorar'; // Amarelo para notas 4.0-6.9
    return 'Precisa atenção'; // Vermelho para notas 0.0-3.9
  };

  // Group criteria by category
  const groupedCriteria = criteria.reduce((groups, criterion) => {
    const category = getCategory(criterion.score);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(criterion);
    return groups;
  }, {} as Record<string, Criterion[]>);

  return (
    <div className="bg-white rounded-xl border border-[#e1e9f4] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] h-[268px]">
      <div className="border-b border-[#e1e9f4] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-[#373753] text-lg font-medium tracking-tight">{title}</div>
          <div className="flex gap-8">
            <button
              onClick={() => isGraphAllowed && setActiveTab('graph')}
              className={`text-center ${!isGraphAllowed ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              disabled={!isGraphAllowed}
            >
              <div className={`text-xs uppercase ${
                activeTab === 'graph' && isGraphAllowed
                  ? 'text-[#3057F2] border-b-2 border-[#3057F2] pb-1' 
                  : 'text-[#677c92]'
              }`}>
                Gráfico
              </div>
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className="text-center cursor-pointer"
            >
              <div className={`text-xs uppercase ${
                activeTab === 'insights' 
                  ? 'text-[#3057F2] border-b-2 border-[#3057F2] pb-1' 
                  : 'text-[#677c92]'
              }`}>
                Insights
              </div>
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {activeTab === 'graph' && isGraphAllowed ? (
          <div className="h-[200px] p-4">
            {criteria.length > 0 ? (
              generateRadarChart()
            ) : (
              <div className="flex items-center justify-center h-full text-[#677c92] text-base">
                Nenhum critério disponível
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 h-[200px] overflow-y-auto space-y-4">
            {criteria.length > 0 ? (
              Object.entries(groupedCriteria).map(([category, categoryItems]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${
                      category === 'Mandando bem' ? 'bg-[#059669]' :
                      category === 'Pode melhorar' ? 'bg-[#d97706]' : 'bg-[#dc2626]'
                    }`}></div>
                    <h3 className="text-[#373753] text-lg font-medium tracking-tight">{category}</h3>
                  </div>
                  
                  <div className="space-y-3 ml-5">
                    {categoryItems.map((criterion, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-[#677c92] text-base">{criterion.name}</span>
                        <div className="flex items-center gap-1">
                          <span className={getScoreColor(criterion.score)}>
                            {criterion.score.toFixed(1)}
                          </span>
                          <span className="text-[#677c92] text-base">/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-[#677c92] text-base">
                Nenhum critério disponível
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
