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

function Frame48095660() {
  return (
    <button className="cursor-pointer relative shrink-0">
      <div className="box-border content-stretch flex flex-row gap-4 items-start justify-start p-0 relative">
        <Botoes />
        <div className="font-['Random_Grotesque_Standard_Semibold:StandardSemibold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#373753] text-[32px] text-left text-nowrap tracking-[-0.64px]">
          <p className="adjustLetterSpacing block leading-[40px] whitespace-pre">
            Feedback
          </p>
        </div>
      </div>
    </button>
  );
}

function Frame48095592() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="box-border content-stretch flex flex-row gap-[882px] items-start justify-start p-0 relative w-full">
        <Frame48095660 />
      </div>
    </div>
  );
}

function Pesquisar() {
  return (
    <div className="relative shrink-0" data-name="Pesquisar">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-row gap-2 items-start justify-start px-6 py-4 relative">
          <div className="font-['Cerebri_Sans_Pro:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#373753] text-[18px] text-left text-nowrap tracking-[-0.36px]">
            <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
              Dados do Feedback
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

function Text() {
  return (
    <div
      className="basis-0 grid-cols-[max-content] grid-rows-[max-content] grow inline-grid leading-[0] min-h-px min-w-px place-items-start relative shrink-0"
      data-name="Text"
    >
      <div className="[grid-area:1_/_1] flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center ml-0 mt-3 not-italic relative text-[#373753] text-[16px] text-left translate-y-[-50%] w-[220px]">
        <p className="block leading-[24px]">Abordagem</p>
      </div>
    </div>
  );
}

function SingleSelect() {
  return (
    <div
      className="bg-[#ffffff] h-10 relative rounded-[10px] shrink-0 w-full"
      data-name="Single select"
    >
      <div className="absolute border border-[#e1e9f4] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row h-10 items-center justify-between px-4 py-0 relative w-full">
          <Text />
        </div>
      </div>
    </div>
  );
}

function PlaceholderInputsEMultiselects() {
  return (
    <div
      className="basis-0 grow h-[72px] min-h-px min-w-px relative shrink-0"
      data-name="Placeholder inputs e multiselects"
    >
      <div className="box-border content-stretch flex flex-col h-[72px] items-start justify-between p-0 relative w-full">
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#373753] text-[16px] text-left w-full">
          <p className="leading-[24px]">
            <span>{`Nome `}</span>
            <span className="text-[#f23f2c]">*</span>
          </p>
        </div>
        <SingleSelect />
      </div>
    </div>
  );
}

function ChevronDown() {
  return (
    <div className="relative shrink-0 size-6" data-name="chevron-down">
      <div className="flex flex-col items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-col items-center justify-center px-0 py-0.5 relative size-6">
          <div className="flex flex-col font-['Font_Awesome_6_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-center text-nowrap">
            <p className="block leading-[normal] whitespace-pre">
              chevron-down
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SingleSelect1() {
  return (
    <div
      className="bg-[#ffffff] h-10 relative rounded-[10px] shrink-0 w-full"
      data-name="Single select"
    >
      <div className="absolute border border-[#e1e9f4] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row h-10 items-center justify-between px-4 py-0 relative w-full">
          <div className="h-2.5 relative shrink-0 w-[9.758px]">
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 10 10"
            >
              <ellipse
                cx="4.87914"
                cy="5"
                fill="var(--fill-0, #E67C0B)"
                id="Ellipse 8"
                rx="4.87914"
                ry="5"
              />
            </svg>
          </div>
          <ChevronDown />
        </div>
      </div>
    </div>
  );
}

function PlaceholderInputsEMultiselects1() {
  return (
    <div
      className="basis-0 grow h-[72px] min-h-px min-w-px relative shrink-0"
      data-name="Placeholder inputs e multiselects"
    >
      <div className="box-border content-stretch flex flex-col h-[72px] items-start justify-between p-0 relative w-full">
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#373753] text-[16px] text-left w-full">
          <p className="leading-[24px]">
            <span>{`Cor `}</span>
            <span className="text-[#f23f2c]">*</span>
          </p>
        </div>
        <SingleSelect1 />
      </div>
    </div>
  );
}

function Frame48095661() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="box-border content-stretch flex flex-row gap-6 items-start justify-start p-0 relative w-full">
        <PlaceholderInputsEMultiselects />
        <PlaceholderInputsEMultiselects1 />
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div
      className="basis-0 grid-cols-[max-content] grid-rows-[max-content] grow inline-grid leading-[0] min-h-px min-w-px place-items-start relative shrink-0"
      data-name="Text"
    >
      <div className="[grid-area:1_/_1] flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center ml-0 mt-3 not-italic relative text-[#373753] text-[16px] text-left translate-y-[-50%] w-[496px]">
        <p className="block leading-[24px]">{`Termos de saudação `}</p>
      </div>
    </div>
  );
}

function SingleSelect2() {
  return (
    <div
      className="bg-[#ffffff] h-10 relative rounded-[10px] shrink-0 w-full"
      data-name="Single select"
    >
      <div className="absolute border border-[#e1e9f4] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-row h-10 items-start justify-between pb-0 pt-2 px-4 relative w-full">
          <Text1 />
        </div>
      </div>
    </div>
  );
}

function PlaceholderInputsEMultiselects2() {
  return (
    <div
      className="relative shrink-0 w-full"
      data-name="Placeholder inputs e multiselects"
    >
      <div className="box-border content-stretch flex flex-col gap-2 items-center justify-start p-0 relative w-full">
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#373753] text-[16px] text-left w-full">
          <p className="leading-[24px]">
            <span>{`Descrição `}</span>
            <span className="text-[#f23f2c]">*</span>
          </p>
        </div>
        <SingleSelect2 />
      </div>
    </div>
  );
}

function Frame48095649() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-6 items-start justify-start pb-0 pt-4 px-6 relative w-full">
          <Frame48095661 />
          <PlaceholderInputsEMultiselects2 />
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
      <div className="absolute border border-[#e1e9f4] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col items-start justify-start pb-6 pt-0 px-0 relative w-full">
          <Frame48095580 />
          <Frame48095649 />
        </div>
      </div>
    </div>
  );
}

function Pesquisar1() {
  return (
    <div className="relative shrink-0" data-name="Pesquisar">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-row gap-2 items-start justify-start px-6 py-4 relative">
          <div className="font-['Cerebri_Sans_Pro:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#373753] text-[18px] text-left text-nowrap tracking-[-0.36px]">
            <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
              Complementos da IA
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
        <Pesquisar1 />
      </div>
    </div>
  );
}

function Frame48095581() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="absolute border-[#e1e9f4] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="box-border content-stretch flex flex-row gap-4 items-center justify-start p-0 relative w-full">
        <Frame48095577 />
      </div>
    </div>
  );
}

function X() {
  return (
    <div className="relative shrink-0 size-4" data-name="x">
      <div className="flex flex-col items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-col items-center justify-center px-0 py-0.5 relative size-4">
          <div className="flex flex-col font-['Font_Awesome_6_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1a4a89] text-[12px] text-center text-nowrap">
            <p className="block leading-[normal] whitespace-pre">xmark</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tag() {
  return (
    <div
      className="bg-[#e1e9f4] h-6 relative rounded-md shrink-0"
      data-name="Tag"
    >
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-2 h-6 items-center justify-start p-[8px] relative">
          <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1a4a89] text-[14px] text-left text-nowrap">
            <p className="block leading-[16px] whitespace-pre">Active</p>
          </div>
          <X />
        </div>
      </div>
    </div>
  );
}

function Frame48095666() {
  return (
    <div className="relative shrink-0 w-[171px]">
      <div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative w-[171px]">
        {[...Array(2).keys()].map((_, i) => (
          <Tag key={i} />
        ))}
      </div>
    </div>
  );
}

function SingleSelect3() {
  return (
    <div
      className="bg-[#ffffff] h-10 relative rounded-[10px] shrink-0 w-full"
      data-name="Single select"
    >
      <div className="absolute border border-[#e1e9f4] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-[119px] h-10 items-center justify-start px-2 py-0 relative w-full">
          <Frame48095666 />
        </div>
      </div>
    </div>
  );
}

function PlaceholderInputsEMultiselects3() {
  return (
    <div
      className="h-[88px] relative shrink-0 w-full"
      data-name="Placeholder inputs e multiselects"
    >
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col h-[88px] items-start justify-between pb-0 pt-4 px-0 relative w-full">
          <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#373753] text-[16px] text-left w-full">
            <p className="block leading-[24px]">Palavra chave</p>
          </div>
          <SingleSelect3 />
        </div>
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div
      className="basis-0 grid-cols-[max-content] grid-rows-[max-content] grow inline-grid leading-[0] min-h-px min-w-px place-items-start relative shrink-0"
      data-name="Text"
    >
      <div className="[grid-area:1_/_1] flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center ml-0 mt-3 not-italic relative text-[#677c92] text-[16px] text-left translate-y-[-50%] w-[496px]">
        <p className="block leading-[24px]">&nbsp;</p>
      </div>
    </div>
  );
}

function SingleSelect4() {
  return (
    <div
      className="bg-[#ffffff] h-10 relative rounded-[10px] shrink-0 w-full"
      data-name="Single select"
    >
      <div className="absolute border border-[#e1e9f4] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row h-10 items-center justify-between px-4 py-0 relative w-full">
          <Text2 />
        </div>
      </div>
    </div>
  );
}

function PlaceholderInputsEMultiselects4() {
  return (
    <div
      className="relative shrink-0 w-full"
      data-name="Placeholder inputs e multiselects"
    >
      <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative w-full">
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#373753] text-[16px] text-left w-full">
          <p className="block leading-[24px]">Frase ideal</p>
        </div>
        <SingleSelect4 />
      </div>
    </div>
  );
}

function Frame48095662() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-6 items-start justify-start px-6 py-0 relative w-full">
          <PlaceholderInputsEMultiselects3 />
          <PlaceholderInputsEMultiselects4 />
        </div>
      </div>
    </div>
  );
}

function Box1() {
  return (
    <div
      className="basis-0 bg-[#ffffff] grow min-h-px min-w-px relative rounded-[10px] shrink-0"
      data-name="Box"
    >
      <div className="absolute border border-[#e1e9f4] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col items-start justify-start pb-6 pt-0 px-0 relative w-full">
          <Frame48095581 />
          <Frame48095662 />
        </div>
      </div>
    </div>
  );
}

function Frame48095588() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="[flex-flow:wrap] box-border content-start flex gap-6 items-start justify-start p-0 relative w-full">
        <Box1 />
      </div>
    </div>
  );
}

function Frame48095658() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="box-border content-stretch flex flex-col gap-6 items-start justify-center p-0 relative w-full">
        <Frame48095588 />
      </div>
    </div>
  );
}

function Frame48095664() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="box-border content-stretch flex flex-col gap-6 items-center justify-start p-0 relative w-full">
        <Box />
        <Frame48095658 />
      </div>
    </div>
  );
}

function Frame48095665() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="box-border content-stretch flex flex-col gap-6 items-center justify-start p-0 relative w-full">
        <Frame48095592 />
        <Frame48095664 />
      </div>
    </div>
  );
}

function Botoes1() {
  return (
    <div
      className="bg-[#3057f2] h-10 relative rounded-[10px] shrink-0 w-full"
      data-name="Botões"
    >
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-2 h-10 items-center justify-center px-6 py-4 relative w-full">
          <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
            <p className="block leading-[24px] whitespace-pre">Criar</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame2425() {
  return (
    <div className="relative shrink-0">
      <div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative">
        <div className="flex flex-col font-['Cerebri_Sans_Pro:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#677c92] text-[16px] text-center text-nowrap">
          <p className="block leading-[24px] whitespace-pre">Cancelar</p>
        </div>
      </div>
    </div>
  );
}

function Botoes2() {
  return (
    <button
      className="cursor-pointer h-8 relative rounded-[10px] shrink-0 w-full"
      data-name="Botões"
    >
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-2 h-8 items-center justify-center px-6 py-4 relative w-full">
          <Frame2425 />
        </div>
      </div>
    </button>
  );
}

function Frame48095663() {
  return (
    <div className="relative shrink-0 w-[398px]">
      <div className="box-border content-stretch flex flex-col gap-4 items-center justify-start p-0 relative w-[398px]">
        <Botoes1 />
        <Botoes2 />
      </div>
    </div>
  );
}

export default function ModalLateral() {
  return (
    <div
      className="bg-[#f9fafc] relative rounded-bl-[16px] rounded-tl-[16px] size-full"
      data-name="Modal lateral"
    >
      <div className="flex flex-col items-center relative size-full">
        <div className="box-border content-stretch flex flex-col gap-12 items-center justify-start overflow-clip p-[24px] relative size-full">
          <Frame48095665 />
          <Frame48095663 />
        </div>
      </div>
      <div className="absolute border border-[#e1e9f4] border-solid inset-0 pointer-events-none rounded-bl-[16px] rounded-tl-[16px] shadow-[0px_4px_18px_0px_rgba(34,54,77,0.12)]" />
    </div>
  );
}
