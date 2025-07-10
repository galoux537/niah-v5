import svgPaths from "./svg-5wbynujgtk";

function BtnIcon() {
  return (
    <div className="absolute inset-0" data-name="btn-icon">
      <div
        className="absolute bg-[#ffffff] inset-0 rounded-[1000px]"
        data-name="Rectangle"
      >
        <div className="absolute border border-[#e1e9f4] border-solid inset-0 pointer-events-none rounded-[1000px]" />
      </div>
    </div>
  );
}

function ChevronLeft() {
  return (
    <div className="absolute inset-[20%]" data-name="chevron-left">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-row items-center justify-center px-0 py-0.5 relative size-full">
          <div className="flex flex-col font-['Font_Awesome_6_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#373753] text-[16px] text-center text-nowrap">
            <p className="block leading-[normal] whitespace-pre">angle-left</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Botoes() {
  return (
    <div
      className="relative shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] shrink-0 size-10"
      data-name="Botões"
    >
      <BtnIcon />
      <ChevronLeft />
    </div>
  );
}

function Frame48095866() {
  return (
    <button className="cursor-pointer relative shrink-0">
      <div className="box-border content-stretch flex flex-row gap-4 items-center justify-start p-0 relative">
        <Botoes />
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#373753] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">Voltar</p>
        </div>
      </div>
    </button>
  );
}

function Frame48095691() {
  return (
    <div className="relative shrink-0">
      <div className="box-border content-stretch flex flex-row gap-4 items-center justify-start p-0 relative">
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#373753] text-[20px] text-left text-nowrap tracking-[-0.4px]">
          <p className="adjustLetterSpacing block leading-[32px] whitespace-pre">
            Tarsila do Amaral
          </p>
        </div>
      </div>
    </div>
  );
}

function Frame48095979() {
  return (
    <div className="relative shrink-0">
      <div className="box-border content-stretch flex flex-col items-start justify-center p-0 relative">
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[12px] text-left text-nowrap uppercase">
          <p className="block leading-[16px] whitespace-pre">agente</p>
        </div>
        <Frame48095691 />
      </div>
    </div>
  );
}

function Frame48095695() {
  return (
    <div className="relative shrink-0">
      <div className="box-border content-stretch flex flex-row gap-4 items-center justify-start p-0 relative">
        <Frame48095979 />
      </div>
    </div>
  );
}

function Frame48095692() {
  return (
    <div className="relative shrink-0">
      <div className="box-border content-stretch flex flex-row gap-4 items-center justify-start p-0 relative">
        <Frame48095695 />
      </div>
    </div>
  );
}

function Component41() {
  return (
    <div
      className="basis-0 bg-[#ffffff] grow min-h-px min-w-px relative rounded-[10px] shrink-0"
      data-name="Component 41"
    >
      <div className="absolute border border-[#e1e9f4] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]" />
      <div className="flex flex-col justify-center relative size-full">
        <div className="box-border content-stretch flex flex-col gap-4 items-start justify-center px-6 py-4 relative w-full">
          <Frame48095692 />
        </div>
      </div>
    </div>
  );
}

function Snooze() {
  return (
    <div className="relative shrink-0 size-6" data-name="Snooze">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-row items-center justify-center px-0 py-0.5 relative size-6">
          <div className="flex flex-col font-['Font_Awesome_6_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#015901] text-[18px] text-center text-nowrap">
            <p className="block leading-[normal] whitespace-pre">thumbs-up</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div
      className="bg-[#c9f2cd] relative rounded-[300px] shrink-0 size-10"
      data-name="Icon"
    >
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-row items-center justify-center p-[9px] relative size-10">
          <Snooze />
        </div>
      </div>
    </div>
  );
}

function Frame48095460() {
  return (
    <div className="relative shrink-0">
      <div className="box-border content-stretch flex flex-row gap-[5px] items-center justify-start p-0 relative">
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#373753] text-[0px] text-left text-nowrap tracking-[-0.4px]">
          <p className="whitespace-pre">
            <span className="leading-[32px] text-[#008a35] text-[20px]">
              9.7
            </span>
            <span className="adjustLetterSpacing font-['Cerebri_Sans_Pro:Regular',_sans-serif] leading-[24px] not-italic text-[#677c92] text-[16px]">
              /10
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function Frame48095456() {
  return (
    <div className="relative shrink-0">
      <div className="box-border content-stretch flex flex-row gap-4 items-center justify-start p-0 relative">
        <Frame48095460 />
      </div>
    </div>
  );
}

function Frame39590() {
  return (
    <div className="relative shrink-0">
      <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative">
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[12px] text-left text-nowrap uppercase">
          <p className="block leading-[16px] whitespace-pre">Média</p>
        </div>
        <Frame48095456 />
      </div>
    </div>
  );
}

function MediaDaEmpresa() {
  return (
    <div
      className="basis-0 bg-[#ffffff] grow min-h-px min-w-px relative rounded-[10px] shrink-0"
      data-name="media da empresa"
    >
      <div className="absolute border border-[#e1e9f4] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-4 items-center justify-start p-[16px] relative w-full">
          <Icon />
          <Frame39590 />
        </div>
      </div>
    </div>
  );
}

function Frame48095980() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="box-border content-stretch flex flex-row gap-6 items-start justify-start p-0 relative w-full">
        <Component41 />
        <MediaDaEmpresa />
      </div>
    </div>
  );
}

function Pesquisar() {
  return (
    <div className="relative shrink-0" data-name="Pesquisar">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-row gap-2 items-start justify-start px-6 py-3 relative">
          <div className="font-['Cerebri_Sans_Pro:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#373753] text-[18px] text-left text-nowrap tracking-[-0.36px]">
            <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
              Geral
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricasDeAtivosEInatios() {
  return (
    <div className="relative shrink-0" data-name="Métricas de ativos e inatios">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-row items-center justify-center pl-0 pr-6 py-0 relative">
          <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#373753] text-[0px] text-left text-nowrap">
            <p className="whitespace-pre">
              <span className="font-['Cerebri_Sans_Pro:Regular',_sans-serif] leading-[16px] not-italic text-[#677c92] text-[12px] uppercase">
                Total
              </span>
              <span className="leading-[normal] text-[15px]"> </span>
              <span className="adjustLetterSpacing font-['Cerebri_Sans_Pro:Regular',_sans-serif] leading-[24px] not-italic text-[18px] tracking-[-0.36px]">
                200
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame48095576() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
      <div className="[flex-flow:wrap] box-border content-center flex gap-4 items-center justify-between p-0 relative w-full">
        <Pesquisar />
        <MetricasDeAtivosEInatios />
      </div>
    </div>
  );
}

function Frame48095580() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="absolute border-[#e1e9f4] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="box-border content-stretch flex flex-row gap-4 items-center justify-start p-0 relative w-full">
        <Frame48095576 />
      </div>
    </div>
  );
}

function Frame48097234() {
  return (
    <div className="relative shrink-0">
      <div className="box-border content-stretch flex flex-col font-['Cerebri_Sans_Pro:Medium',_sans-serif] gap-1 items-start justify-start leading-[0] not-italic p-0 relative text-left text-nowrap">
        <div className="flex flex-col justify-center relative shrink-0 text-[#677c92] text-[12px] uppercase">
          <p className="block leading-[16px] text-nowrap whitespace-pre">Bom</p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 text-[#006c17] text-[22px] tracking-[-0.44px]">
          <p className="adjustLetterSpacing block leading-[32px] text-nowrap whitespace-pre">
            85%
          </p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 text-[#373753] text-[14px]">
          <p className="block leading-[16px] text-nowrap whitespace-pre">
            190 Feedbacks
          </p>
        </div>
      </div>
    </div>
  );
}

function Component2() {
  return (
    <div className="relative shrink-0 w-[188px]" data-name="2">
      <div className="box-border content-stretch flex flex-col gap-1 items-start justify-start p-0 relative w-[188px]">
        <Frame48097234 />
      </div>
    </div>
  );
}

function Frame48097232() {
  return (
    <div className="relative shrink-0">
      <div className="box-border content-stretch flex flex-col font-['Cerebri_Sans_Pro:Medium',_sans-serif] gap-1 items-start justify-start leading-[0] not-italic p-0 relative text-left text-nowrap">
        <div className="flex flex-col justify-center relative shrink-0 text-[#677c92] text-[12px] uppercase">
          <p className="block leading-[16px] text-nowrap whitespace-pre">
            Neutro
          </p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 text-[#dc9610] text-[22px] tracking-[-0.44px]">
          <p className="adjustLetterSpacing block leading-[32px] text-nowrap whitespace-pre">
            10%
          </p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 text-[#373753] text-[14px]">
          <p className="block leading-[16px] text-nowrap whitespace-pre">
            6 Feedbacks
          </p>
        </div>
      </div>
    </div>
  );
}

function Component3() {
  return (
    <div className="relative shrink-0 w-[188px]" data-name="3">
      <div className="box-border content-stretch flex flex-col gap-1 items-center justify-start p-0 relative w-[188px]">
        <Frame48097232 />
      </div>
    </div>
  );
}

function Frame48097233() {
  return (
    <div className="relative shrink-0">
      <div className="box-border content-stretch flex flex-col font-['Cerebri_Sans_Pro:Medium',_sans-serif] gap-1 items-start justify-start leading-[0] not-italic p-0 relative text-left text-nowrap">
        <div className="flex flex-col justify-center relative shrink-0 text-[#677c92] text-[12px] uppercase">
          <p className="block leading-[16px] text-nowrap whitespace-pre">
            Ruim
          </p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 text-[#dc2f1c] text-[22px] tracking-[-0.44px]">
          <p className="adjustLetterSpacing block leading-[32px] text-nowrap whitespace-pre">
            5%
          </p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 text-[#373753] text-[14px]">
          <p className="block leading-[16px] text-nowrap whitespace-pre">
            4 Feedbacks
          </p>
        </div>
      </div>
    </div>
  );
}

function Component5() {
  return (
    <div className="relative shrink-0 w-[188px]" data-name="5">
      <div className="box-border content-stretch flex flex-col gap-1 items-end justify-start p-0 relative w-[188px]">
        <Frame48097233 />
      </div>
    </div>
  );
}

function Frame48095648() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-row items-start justify-between pb-0 pt-4 px-6 relative w-full">
          <Component2 />
          <Component3 />
          <Component5 />
        </div>
      </div>
    </div>
  );
}

function Frame48095867() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="box-border content-stretch flex flex-row-reverse items-start justify-start pl-0 pr-1.5 py-0 relative w-full">
        <div
          className="basis-0 bg-[#5cb868] grow h-2 min-h-px min-w-px mr-[-6px] order-3 relative rounded-[64px] shrink-0"
          data-name="Rectangle"
        >
          <div className="absolute border-[#ffffff] border-[0px_2px_0px_0px] border-solid bottom-0 left-0 pointer-events-none right-[-2px] rounded-[64px] top-0" />
        </div>
        <div
          className="bg-[#ffbd00] h-2 mr-[-6px] order-2 relative rounded-[64px] shrink-0 w-[43px]"
          data-name="Rectangle"
        >
          <div className="absolute border-[#ffffff] border-[0px_2px_0px_0px] border-solid bottom-0 left-0 pointer-events-none right-[-2px] rounded-[64px] top-0" />
        </div>
        <div
          className="bg-[#dc2f1c] h-2 mr-[-6px] order-1 rounded-[64px] shrink-0 w-[19px]"
          data-name="Rectangle"
        />
      </div>
    </div>
  );
}

function Frame48095868() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start pb-6 pt-4 px-6 relative w-full">
          <Frame48095867 />
        </div>
      </div>
    </div>
  );
}

function Frame48097231() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative w-full">
        <Frame48095648 />
        <Frame48095868 />
      </div>
    </div>
  );
}

function Notas() {
  return (
    <div
      className="bg-[#ffffff] relative rounded-[10px] shrink-0 w-full"
      data-name="notas"
    >
      <div className="absolute border border-[#e1e9f4] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]" />
      <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative w-full">
        <Frame48095580 />
        <Frame48097231 />
      </div>
    </div>
  );
}

function Frame48095983() {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative shrink-0">
      <div className="box-border content-stretch flex flex-col gap-6 items-end justify-start p-0 relative size-full">
        <Frame48095980 />
        <Notas />
      </div>
    </div>
  );
}

function Pesquisar1() {
  return (
    <div className="relative shrink-0" data-name="Pesquisar">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-row gap-2 items-start justify-start px-6 py-3 relative">
          <div className="font-['Cerebri_Sans_Pro:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#373753] text-[18px] text-left text-nowrap tracking-[-0.36px]">
            <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
              Critérios
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Ativos() {
  return (
    <div className="relative shrink-0" data-name="Ativos">
      <div className="box-border content-stretch flex flex-col items-center justify-start p-0 relative">
        <div className="font-['Cerebri_Sans_Pro:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#373753] text-[12px] text-center text-nowrap uppercase">
          <p className="block leading-[16px] whitespace-pre">Gráfico</p>
        </div>
      </div>
    </div>
  );
}

function Frame48095578() {
  return (
    <div className="h-9 relative shrink-0">
      <div className="flex flex-col items-center relative size-full">
        <div className="box-border content-stretch flex flex-col h-9 items-center justify-between pb-0 pt-1 px-0 relative">
          <Ativos />
          <div
            className="h-0 relative shrink-0 w-full"
            data-name="active indicator"
          >
            <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 54 1"
              >
                <line
                  id="active indicator"
                  stroke="var(--stroke-0, #3057F2)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  x1="0.5"
                  x2="53.5"
                  y1="0.5"
                  y2="0.5"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Ativos1() {
  return (
    <div className="relative shrink-0" data-name="Ativos">
      <div className="box-border content-stretch flex flex-col items-center justify-start p-0 relative">
        <div className="font-['Cerebri_Sans_Pro:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#677c92] text-[12px] text-center text-nowrap uppercase">
          <p className="block leading-[16px] whitespace-pre">Insights</p>
        </div>
      </div>
    </div>
  );
}

function Frame48095579() {
  return (
    <div className="h-9 relative shrink-0">
      <div className="flex flex-col items-center relative size-full">
        <div className="box-border content-stretch flex flex-col h-9 items-center justify-between pb-0 pt-1 px-0 relative">
          <Ativos1 />
          <div
            className="h-0 relative shrink-0 w-full"
            data-name="active indicator"
          >
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 32 32"
            >
              <g id="active indicator"></g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricasDeAtivosEInatios1() {
  return (
    <div
      className="h-full relative shrink-0"
      data-name="Métricas de ativos e inatios"
    >
      <div className="flex flex-row items-end relative size-full">
        <div className="box-border content-stretch flex flex-row gap-8 h-full items-end justify-start pb-0 pl-0 pr-6 pt-2 relative">
          <Frame48095578 />
          <Frame48095579 />
        </div>
      </div>
    </div>
  );
}

function Frame48095581() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="absolute border-[#e1e9f4] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-row items-center justify-between p-0 relative w-full">
        <Pesquisar1 />
        <div className="flex flex-row items-center self-stretch">
          <MetricasDeAtivosEInatios1 />
        </div>
      </div>
    </div>
  );
}

function Line() {
  return (
    <div
      className="absolute h-[170.251px] left-[78.206px] top-[2.214px] w-[147.267px]"
      data-name="Line"
    >
      <div className="absolute bottom-[-0.289%] left-[-0.289%] right-[-0.289%] top-[-0.289%]">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 149 172"
        >
          <g id="Line">
            <path
              d={svgPaths.p2a6a4480}
              id="Vector"
              stroke="var(--stroke-0, #E1E9F4)"
              strokeWidth="0.851254"
            />
            <path
              d="M148.267 43.5631L1 128.689"
              id="Vector_2"
              stroke="var(--stroke-0, #E1E9F4)"
              strokeWidth="0.851254"
            />
            <path
              d="M74.6338 1V171.251"
              id="Vector_3"
              stroke="var(--stroke-0, #E1E9F4)"
              strokeWidth="0.851254"
            />
            <path
              d="M1 43.5631L148.267 128.689"
              id="Vector_4"
              stroke="var(--stroke-0, #E1E9F4)"
              strokeWidth="0.851254"
            />
            <path
              d={svgPaths.p30de5900}
              id="Vector_5"
              stroke="var(--stroke-0, #E1E9F4)"
              strokeWidth="0.851254"
            />
            <path
              d={svgPaths.p11e52700}
              id="Vector_6"
              stroke="var(--stroke-0, #E1E9F4)"
              strokeWidth="0.851254"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

function GraficoRadar() {
  return (
    <div
      className="h-[176.21px] relative shrink-0 w-[309.857px]"
      data-name="grafico radar"
    >
      <Line />
      <div
        className="absolute h-[122.155px] left-[93.211px] top-[19.153px] w-[106.407px]"
        data-name="Vector"
      >
        <div className="absolute bottom-[-10.591%] left-[-8.987%] right-[-8.987%] top-[-5.065%]">
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 126 143"
          >
            <g filter="url(#filter0_ddd_5_18511)" id="Vector" opacity="0.8">
              <path d={svgPaths.p1ff32400} fill="var(--fill-0, #5CB868)" />
            </g>
            <defs>
              <filter
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
                height="141.28"
                id="filter0_ddd_5_18511"
                width="125.532"
                x="0.437547"
                y="0.81253"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  result="hardAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                />
                <feMorphology
                  in="SourceAlpha"
                  operator="dilate"
                  radius="2.81249"
                  result="effect1_dropShadow_5_18511"
                />
                <feOffset dy="2.81249" />
                <feGaussianBlur stdDeviation="2.81249" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.196078 0 0 0 0 0.278431 0 0 0 0 0.360784 0 0 0 0.02 0"
                />
                <feBlend
                  in2="BackgroundImageFix"
                  mode="normal"
                  result="effect1_dropShadow_5_18511"
                />
                <feColorMatrix
                  in="SourceAlpha"
                  result="hardAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                />
                <feMorphology
                  in="SourceAlpha"
                  operator="dilate"
                  radius="1.68749"
                  result="effect2_dropShadow_5_18511"
                />
                <feOffset dy="3.37498" />
                <feGaussianBlur stdDeviation="3.93748" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.196078 0 0 0 0 0.278431 0 0 0 0 0.360784 0 0 0 0.04 0"
                />
                <feBlend
                  in2="effect1_dropShadow_5_18511"
                  mode="normal"
                  result="effect2_dropShadow_5_18511"
                />
                <feColorMatrix
                  in="SourceAlpha"
                  result="hardAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                />
                <feMorphology
                  in="SourceAlpha"
                  operator="dilate"
                  radius="1.68749"
                  result="effect3_dropShadow_5_18511"
                />
                <feOffset dy="2.81249" />
                <feGaussianBlur stdDeviation="3.65623" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.196078 0 0 0 0 0.278431 0 0 0 0 0.360784 0 0 0 0.06 0"
                />
                <feBlend
                  in2="effect2_dropShadow_5_18511"
                  mode="normal"
                  result="effect3_dropShadow_5_18511"
                />
                <feBlend
                  in="SourceGraphic"
                  in2="effect3_dropShadow_5_18511"
                  mode="normal"
                  result="shape"
                />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <div
        className="absolute bottom-[70.316%] font-['Cerebri_Sans_Pro:Regular',_sans-serif] leading-[0] not-italic text-[#677c92] text-[12px] text-left text-nowrap top-[21.739%] uppercase"
        style={{ left: "calc(50% + 78.5px)" }}
      >
        <p className="block leading-[13.6201px] whitespace-pre">Cordialidade</p>
      </div>
      <div
        className="absolute bottom-[22.007%] font-['Cerebri_Sans_Pro:Regular',_sans-serif] leading-[0] not-italic text-[#677c92] text-[12px] text-left text-nowrap top-[70.048%] uppercase"
        style={{ left: "calc(50% - 163.499px)" }}
      >
        <p className="block leading-[13.6201px] whitespace-pre">Negociação</p>
      </div>
      <div
        className="absolute font-['Cerebri_Sans_Pro:Regular',_sans-serif] leading-[0] not-italic text-[#677c92] text-[12px] text-left text-nowrap uppercase"
        style={{ top: "calc(50% + 35.0533px)", left: "calc(50% + 78.5px)" }}
      >
        <p className="block leading-[13.6201px] whitespace-pre">Formalidade</p>
      </div>
      <div
        className="absolute font-['Cerebri_Sans_Pro:Regular',_sans-serif] leading-[0] not-italic text-[#677c92] text-[12px] text-left text-nowrap uppercase"
        style={{ top: "calc(50% + 91.2361px)", left: "calc(50% - 32.5004px)" }}
      >
        <p className="block leading-[13.6201px] whitespace-pre">Saudação</p>
      </div>
      <div
        className="absolute bottom-[101.717%] font-['Cerebri_Sans_Pro:Regular',_sans-serif] leading-[0] not-italic text-[#677c92] text-[12px] text-left text-nowrap top-[-9.662%] uppercase"
        style={{ left: "calc(50% - 37.4977px)" }}
      >
        <p className="block leading-[13.6201px] whitespace-pre">Finalização</p>
      </div>
      <div
        className="absolute bottom-[70.316%] font-['Cerebri_Sans_Pro:Regular',_sans-serif] leading-[0] not-italic text-[#677c92] text-[12px] text-left text-nowrap top-[21.739%] uppercase"
        style={{ left: "calc(50% - 158.499px)" }}
      >
        <p className="block leading-[13.6201px] whitespace-pre">Abordagem</p>
      </div>
    </div>
  );
}

function Frame48095765() {
  return (
    <div className="h-[237.5px] relative shrink-0 w-[387.321px]">
      <div className="flex flex-col items-center justify-center relative size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[69.441px] h-[237.5px] items-center justify-center px-0 py-[27.24px] relative w-[387.321px]">
          <GraficoRadar />
        </div>
      </div>
    </div>
  );
}

function Criterios() {
  return (
    <div
      className="basis-0 bg-[#ffffff] grow h-[296px] min-h-px min-w-px relative rounded-[10px] shrink-0"
      data-name="critérios"
    >
      <div className="absolute border border-[#e1e9f4] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]" />
      <div className="flex flex-col items-center relative size-full">
        <div className="box-border content-stretch flex flex-col h-[296px] items-center justify-start pb-[17px] pt-px px-px relative w-full">
          <Frame48095581 />
          <Frame48095765 />
        </div>
      </div>
    </div>
  );
}

function Frame48095981() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="box-border content-stretch flex flex-row gap-6 items-end justify-start p-0 relative w-full">
        <div className="flex flex-row items-end self-stretch">
          <Frame48095983 />
        </div>
        <Criterios />
      </div>
    </div>
  );
}

function Search() {
  return (
    <div className="relative shrink-0 size-6" data-name="search">
      <div className="flex flex-col items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-col items-center justify-center px-0 py-0.5 relative size-6">
          <div className="flex flex-col font-['Font_Awesome_6_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[14px] text-center text-nowrap">
            <p className="block leading-[normal] whitespace-pre">search</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pesquisar2() {
  return (
    <div className="relative shrink-0" data-name="Pesquisar">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-row gap-2 items-start justify-start px-6 py-4 relative">
          <Search />
          <div className="font-['Cerebri_Sans_Pro:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
            <p className="block leading-[24px] whitespace-pre">
              Pesquisar Ligação
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame48095577() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
      <div className="[flex-flow:wrap] box-border content-center flex gap-4 items-center justify-between p-0 relative w-full">
        <Pesquisar2 />
      </div>
    </div>
  );
}

function Frame48095582() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="box-border content-stretch flex flex-row gap-4 items-center justify-start p-0 relative w-full">
        <Frame48095577 />
      </div>
    </div>
  );
}

function Frame48095992() {
  return (
    <div className="bg-[#f0f4fa] h-10 relative shrink-0 w-full">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row font-['Cerebri_Sans_Pro:Regular',_sans-serif] h-10 items-center justify-between leading-[0] not-italic pl-6 pr-[42px] py-0 relative text-[#677c92] text-[12px] uppercase w-full">
          <div className="flex flex-col justify-center relative shrink-0 text-left w-[242px]">
            <p className="block leading-[16px]">número</p>
          </div>
          <div className="flex flex-col justify-center relative shrink-0 text-left w-[51px]">
            <p className="block leading-[16px]">nota</p>
          </div>
          <div className="flex flex-col justify-center relative shrink-0 text-center w-[137px]">
            <p className="block leading-[16px]">duração da ligação</p>
          </div>
          <div className="flex flex-col justify-center relative shrink-0 text-left w-[184px]">
            <p className="block leading-[16px]">data</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Edit() {
  return (
    <div className="relative shrink-0 size-6" data-name="edit">
      <div className="flex flex-col items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-col items-center justify-center px-0 py-0.5 relative size-6">
          <div className="flex flex-col font-['Font_Awesome_6_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#e67c0b] text-[16px] text-center text-nowrap">
            <p className="block leading-[normal] whitespace-pre">
              triangle-exclamation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExcluirIcon() {
  return (
    <div className="relative shrink-0" data-name="Excluir icon">
      <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative">
        <Edit />
      </div>
    </div>
  );
}

function ExcluirIcon1() {
  return (
    <div className="relative shrink-0" data-name="Excluir icon">
      <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative">
        <ExcluirIcon />
      </div>
    </div>
  );
}

function Frame48095873() {
  return (
    <div className="relative shrink-0 w-52">
      <div className="box-border content-stretch flex flex-row gap-2 items-start justify-start p-0 relative w-52">
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">
            55 42 98866-2988
          </p>
        </div>
        <ExcluirIcon1 />
      </div>
    </div>
  );
}

function Frame48096054() {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative shrink-0">
      <div className="box-border content-stretch flex flex-row items-center justify-between p-0 relative size-full">
        <Frame48095873 />
        <div className="font-['Cerebri_Sans_Pro:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#373753] text-[0px] text-left text-nowrap tracking-[-0.48px]">
          <p className="leading-[24px] text-[16px] whitespace-pre">
            <span className="font-['Cerebri_Sans_Pro:Medium',_sans-serif] text-[#dc2f1c]">
              2.2
            </span>
            <span className="adjustLetterSpacing font-['Cerebri_Sans_Pro:Regular',_sans-serif] text-[#677c92]">
              /10
            </span>
          </p>
        </div>
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">5min 32s</p>
        </div>
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">
            10/01/2024 às 18:30
          </p>
        </div>
      </div>
    </div>
  );
}

function Edit1() {
  return (
    <div className="relative shrink-0 size-6" data-name="edit">
      <div className="flex flex-col items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-col items-center justify-center px-0 py-0.5 size-6" />
      </div>
    </div>
  );
}

function ExcluirIcon2() {
  return (
    <div className="relative shrink-0" data-name="Excluir icon">
      <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative">
        <Edit1 />
      </div>
    </div>
  );
}

function ListModal() {
  return (
    <div className="relative shrink-0 w-full" data-name="List modal">
      <div className="absolute border-[#e1e9f4] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-6 items-center justify-start px-6 py-2 relative w-full">
          <div className="flex flex-row items-center self-stretch">
            <Frame48096054 />
          </div>
          <ExcluirIcon2 />
        </div>
      </div>
    </div>
  );
}

function ExcluirIcon3() {
  return (
    <div className="relative shrink-0 size-6" data-name="Excluir icon">
      <div className="size-6" />
    </div>
  );
}

function Frame48095874() {
  return (
    <div className="relative shrink-0 w-52">
      <div className="box-border content-stretch flex flex-row gap-2 items-start justify-start p-0 relative w-52">
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">
            55 42 98866-2988
          </p>
        </div>
        <ExcluirIcon3 />
      </div>
    </div>
  );
}

function Frame48096055() {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative shrink-0">
      <div className="box-border content-stretch flex flex-row items-center justify-between p-0 relative size-full">
        <Frame48095874 />
        <div className="font-['Cerebri_Sans_Pro:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#373753] text-[0px] text-left text-nowrap tracking-[-0.48px]">
          <p className="leading-[24px] text-[16px] whitespace-pre">
            <span className="font-['Cerebri_Sans_Pro:Medium',_sans-serif] text-[#008a35]">
              6.4
            </span>
            <span className="adjustLetterSpacing font-['Cerebri_Sans_Pro:Regular',_sans-serif] text-[#677c92]">
              /10
            </span>
          </p>
        </div>
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">5min 32s</p>
        </div>
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">
            10/01/2024 às 18:30
          </p>
        </div>
      </div>
    </div>
  );
}

function Edit2() {
  return (
    <div className="relative shrink-0 size-6" data-name="edit">
      <div className="flex flex-col items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-col items-center justify-center px-0 py-0.5 size-6" />
      </div>
    </div>
  );
}

function ExcluirIcon4() {
  return (
    <div className="relative shrink-0" data-name="Excluir icon">
      <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative">
        <Edit2 />
      </div>
    </div>
  );
}

function ListModal1() {
  return (
    <div className="relative shrink-0 w-full" data-name="List modal">
      <div className="absolute border-[#e1e9f4] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-6 items-center justify-start px-6 py-2 relative w-full">
          <div className="flex flex-row items-center self-stretch">
            <Frame48096055 />
          </div>
          <ExcluirIcon4 />
        </div>
      </div>
    </div>
  );
}

function ExcluirIcon5() {
  return (
    <div className="relative shrink-0 size-6" data-name="Excluir icon">
      <div className="size-6" />
    </div>
  );
}

function Frame48095875() {
  return (
    <div className="relative shrink-0 w-52">
      <div className="box-border content-stretch flex flex-row gap-2 items-start justify-start p-0 relative w-52">
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">
            55 42 98866-2988
          </p>
        </div>
        <ExcluirIcon5 />
      </div>
    </div>
  );
}

function Frame48096056() {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative shrink-0">
      <div className="box-border content-stretch flex flex-row items-center justify-between p-0 relative size-full">
        <Frame48095875 />
        <div className="font-['Cerebri_Sans_Pro:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#373753] text-[0px] text-left text-nowrap tracking-[-0.48px]">
          <p className="leading-[24px] text-[16px] whitespace-pre">
            <span className="font-['Cerebri_Sans_Pro:Medium',_sans-serif] text-[#dc9610]">
              5.2
            </span>
            <span className="adjustLetterSpacing font-['Cerebri_Sans_Pro:Regular',_sans-serif] text-[#677c92]">
              /10
            </span>
          </p>
        </div>
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">5min 32s</p>
        </div>
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">
            10/01/2024 às 18:30
          </p>
        </div>
      </div>
    </div>
  );
}

function Edit3() {
  return (
    <div className="relative shrink-0 size-6" data-name="edit">
      <div className="flex flex-col items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-col items-center justify-center px-0 py-0.5 size-6" />
      </div>
    </div>
  );
}

function ExcluirIcon6() {
  return (
    <div className="relative shrink-0" data-name="Excluir icon">
      <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative">
        <Edit3 />
      </div>
    </div>
  );
}

function ListModal2() {
  return (
    <div className="relative shrink-0 w-full" data-name="List modal">
      <div className="absolute border-[#e1e9f4] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-6 items-center justify-start px-6 py-2 relative w-full">
          <div className="flex flex-row items-center self-stretch">
            <Frame48096056 />
          </div>
          <ExcluirIcon6 />
        </div>
      </div>
    </div>
  );
}

function ExcluirIcon7() {
  return (
    <div className="relative shrink-0 size-6" data-name="Excluir icon">
      <div className="size-6" />
    </div>
  );
}

function Frame48095876() {
  return (
    <div className="relative shrink-0 w-52">
      <div className="box-border content-stretch flex flex-row gap-2 items-start justify-start p-0 relative w-52">
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">
            55 42 98866-2988
          </p>
        </div>
        <ExcluirIcon7 />
      </div>
    </div>
  );
}

function Frame48096057() {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative shrink-0">
      <div className="box-border content-stretch flex flex-row items-center justify-between p-0 relative size-full">
        <Frame48095876 />
        <div className="font-['Cerebri_Sans_Pro:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#373753] text-[0px] text-left text-nowrap tracking-[-0.48px]">
          <p className="leading-[24px] text-[16px] whitespace-pre">
            <span className="font-['Cerebri_Sans_Pro:Medium',_sans-serif] text-[#008a35]">
              9.4
            </span>
            <span className="adjustLetterSpacing font-['Cerebri_Sans_Pro:Regular',_sans-serif] text-[#677c92]">
              /10
            </span>
          </p>
        </div>
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">5min 32s</p>
        </div>
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">
            10/01/2024 às 18:30
          </p>
        </div>
      </div>
    </div>
  );
}

function Edit4() {
  return (
    <div className="relative shrink-0 size-6" data-name="edit">
      <div className="flex flex-col items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-col items-center justify-center px-0 py-0.5 size-6" />
      </div>
    </div>
  );
}

function ExcluirIcon8() {
  return (
    <div className="relative shrink-0" data-name="Excluir icon">
      <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative">
        <Edit4 />
      </div>
    </div>
  );
}

function ListModal3() {
  return (
    <div className="relative shrink-0 w-full" data-name="List modal">
      <div className="absolute border-[#e1e9f4] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-6 items-center justify-start px-6 py-2 relative w-full">
          <div className="flex flex-row items-center self-stretch">
            <Frame48096057 />
          </div>
          <ExcluirIcon8 />
        </div>
      </div>
    </div>
  );
}

function ExcluirIcon9() {
  return (
    <div className="relative shrink-0 size-6" data-name="Excluir icon">
      <div className="size-6" />
    </div>
  );
}

function Frame48095877() {
  return (
    <div className="relative shrink-0 w-52">
      <div className="box-border content-stretch flex flex-row gap-2 items-start justify-start p-0 relative w-52">
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">
            55 42 98866-2988
          </p>
        </div>
        <ExcluirIcon9 />
      </div>
    </div>
  );
}

function Frame48096058() {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative shrink-0">
      <div className="box-border content-stretch flex flex-row items-center justify-between p-0 relative size-full">
        <Frame48095877 />
        <div className="font-['Cerebri_Sans_Pro:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#373753] text-[0px] text-left text-nowrap tracking-[-0.48px]">
          <p className="leading-[24px] text-[16px] whitespace-pre">
            <span className="font-['Cerebri_Sans_Pro:Medium',_sans-serif] text-[#dc9610]">
              4.4
            </span>
            <span className="adjustLetterSpacing font-['Cerebri_Sans_Pro:Regular',_sans-serif] text-[#677c92]">
              /10
            </span>
          </p>
        </div>
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">5min 32s</p>
        </div>
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">
            10/01/2024 às 18:30
          </p>
        </div>
      </div>
    </div>
  );
}

function Edit5() {
  return (
    <div className="relative shrink-0 size-6" data-name="edit">
      <div className="flex flex-col items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-col items-center justify-center px-0 py-0.5 size-6" />
      </div>
    </div>
  );
}

function ExcluirIcon10() {
  return (
    <div className="relative shrink-0" data-name="Excluir icon">
      <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative">
        <Edit5 />
      </div>
    </div>
  );
}

function ListModal4() {
  return (
    <div className="relative shrink-0 w-full" data-name="List modal">
      <div className="absolute border-[#e1e9f4] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-6 items-center justify-start px-6 py-2 relative w-full">
          <div className="flex flex-row items-center self-stretch">
            <Frame48096058 />
          </div>
          <ExcluirIcon10 />
        </div>
      </div>
    </div>
  );
}

function ExcluirIcon11() {
  return (
    <div className="relative shrink-0 size-6" data-name="Excluir icon">
      <div className="size-6" />
    </div>
  );
}

function Frame48095878() {
  return (
    <div className="relative shrink-0 w-52">
      <div className="box-border content-stretch flex flex-row gap-2 items-start justify-start p-0 relative w-52">
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">
            55 42 98866-2988
          </p>
        </div>
        <ExcluirIcon11 />
      </div>
    </div>
  );
}

function Frame48096059() {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative shrink-0">
      <div className="box-border content-stretch flex flex-row items-center justify-between p-0 relative size-full">
        <Frame48095878 />
        <div className="font-['Cerebri_Sans_Pro:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#373753] text-[0px] text-left text-nowrap tracking-[-0.48px]">
          <p className="leading-[24px] text-[16px] whitespace-pre">
            <span className="font-['Cerebri_Sans_Pro:Medium',_sans-serif] text-[#008a35]">
              6.7
            </span>
            <span className="adjustLetterSpacing font-['Cerebri_Sans_Pro:Regular',_sans-serif] text-[#677c92]">
              /10
            </span>
          </p>
        </div>
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">5min 32s</p>
        </div>
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">
            10/01/2024 às 18:30
          </p>
        </div>
      </div>
    </div>
  );
}

function Edit6() {
  return (
    <div className="relative shrink-0 size-6" data-name="edit">
      <div className="flex flex-col items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-col items-center justify-center px-0 py-0.5 size-6" />
      </div>
    </div>
  );
}

function ExcluirIcon12() {
  return (
    <div className="relative shrink-0" data-name="Excluir icon">
      <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative">
        <Edit6 />
      </div>
    </div>
  );
}

function ListModal5() {
  return (
    <div className="relative shrink-0 w-full" data-name="List modal">
      <div className="absolute border-[#e1e9f4] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-6 items-center justify-start px-6 py-2 relative w-full">
          <div className="flex flex-row items-center self-stretch">
            <Frame48096059 />
          </div>
          <ExcluirIcon12 />
        </div>
      </div>
    </div>
  );
}

function Edit7() {
  return (
    <div className="relative shrink-0 size-6" data-name="edit">
      <div className="flex flex-col items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-col items-center justify-center px-0 py-0.5 relative size-6">
          <div className="flex flex-col font-['Font_Awesome_6_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#e67c0b] text-[16px] text-center text-nowrap">
            <p className="block leading-[normal] whitespace-pre">
              triangle-exclamation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExcluirIcon13() {
  return (
    <div className="relative shrink-0" data-name="Excluir icon">
      <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative">
        <Edit7 />
      </div>
    </div>
  );
}

function ExcluirIcon14() {
  return (
    <div className="relative shrink-0" data-name="Excluir icon">
      <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative">
        <ExcluirIcon13 />
      </div>
    </div>
  );
}

function Frame48095879() {
  return (
    <div className="relative shrink-0 w-52">
      <div className="box-border content-stretch flex flex-row gap-2 items-start justify-start p-0 relative w-52">
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">
            55 42 98866-2988
          </p>
        </div>
        <ExcluirIcon14 />
      </div>
    </div>
  );
}

function Frame48096060() {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative shrink-0">
      <div className="box-border content-stretch flex flex-row items-center justify-between p-0 relative size-full">
        <Frame48095879 />
        <div className="font-['Cerebri_Sans_Pro:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#373753] text-[0px] text-left text-nowrap tracking-[-0.48px]">
          <p className="leading-[24px] text-[16px] whitespace-pre">
            <span className="font-['Cerebri_Sans_Pro:Medium',_sans-serif] text-[#dc2f1c]">
              2.4
            </span>
            <span className="adjustLetterSpacing font-['Cerebri_Sans_Pro:Regular',_sans-serif] text-[#677c92]">
              /10
            </span>
          </p>
        </div>
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">5min 32s</p>
        </div>
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-left text-nowrap">
          <p className="block leading-[24px] whitespace-pre">
            10/01/2024 às 18:30
          </p>
        </div>
      </div>
    </div>
  );
}

function Edit8() {
  return (
    <div className="relative shrink-0 size-6" data-name="edit">
      <div className="flex flex-col items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-col items-center justify-center px-0 py-0.5 size-6" />
      </div>
    </div>
  );
}

function ExcluirIcon15() {
  return (
    <div className="relative shrink-0" data-name="Excluir icon">
      <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative">
        <Edit8 />
      </div>
    </div>
  );
}

function ListModal6() {
  return (
    <div className="relative shrink-0 w-full" data-name="List modal">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-6 items-center justify-start px-6 py-2 relative w-full">
          <div className="flex flex-row items-center self-stretch">
            <Frame48096060 />
          </div>
          <ExcluirIcon15 />
        </div>
      </div>
    </div>
  );
}

function Box() {
  return (
    <div
      className="bg-[#ffffff] relative rounded-[10px] shrink-0 w-full"
      data-name="Box"
    >
      <div className="absolute border border-[#e1e9f4] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col items-start justify-start pb-4 pt-0 px-0 relative w-full">
          <Frame48095582 />
          <Frame48095992 />
          <ListModal />
          <ListModal1 />
          <ListModal2 />
          <ListModal3 />
          <ListModal4 />
          <ListModal5 />
          <ListModal6 />
        </div>
      </div>
    </div>
  );
}

function Frame48096727() {
  return (
    <div className="h-[788px] relative shrink-0 w-full">
      <div className="box-border content-stretch flex flex-col gap-6 h-[788px] items-start justify-start overflow-x-clip overflow-y-auto p-0 relative w-full">
        <Frame48095981 />
        <Box />
      </div>
    </div>
  );
}

export default function ModalLateralAgente() {
  return (
    <div
      className="bg-[#f9fafc] relative rounded-bl-[12px] rounded-tl-[12px] size-full"
      data-name="Modal lateral agente"
    >
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-6 items-start justify-start overflow-clip p-[24px] relative size-full">
          <Frame48095866 />
          <Frame48096727 />
        </div>
      </div>
      <div className="absolute border border-[#e1e9f4] border-solid inset-0 pointer-events-none rounded-bl-[12px] rounded-tl-[12px]" />
    </div>
  );
}
