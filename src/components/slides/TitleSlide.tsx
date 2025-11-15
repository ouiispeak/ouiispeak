'use client';

type TitleSlideProps = {
  title: string;
  subtitle?: string;
};

export default function TitleSlide({ title, subtitle }: TitleSlideProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-6 py-8 text-center md:px-10 leading-relaxed md:leading-loose pt-2 md:pt-4">
      <h1 className="mb-4 md:mb-6 max-w-3xl text-balance text-4xl font-bold text-[#0c9599] md:text-5xl lg:text-6xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mb-4 md:mb-5 max-w-2xl text-balance text-xl text-[#222326] md:text-2xl lg:text-3xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
