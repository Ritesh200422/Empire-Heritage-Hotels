export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-serif font-bold text-[#4a1c1c] mb-6">About Us</h1>
      <div className="prose prose-lg text-slate-700">
        <p className="mb-4">
          Welcome to {process.env.NEXT_PUBLIC_APP_NAME || 'Empire Heritage Hotels'}, a legacy of luxury and authentic hospitality. 
          Founded with a vision to combine modern comfort with traditional grandeur, we have been serving our guests for decades.
        </p>
        <p className="mb-4">
          Our properties are more than just hotels; they are destinations in themselves. From our signature rooms to our masterfully crafted culinary delights, every detail is designed to give you an unforgettable experience.
        </p>
        <h2 className="text-2xl font-serif font-bold text-[#4a1c1c] mt-8 mb-4">Our Heritage</h2>
        <p>
          We pride ourselves on preserving the rich cultural heritage of our locations, reflecting it in our architecture, our food, and our warm hospitality. We invite you to be a part of our story.
        </p>
      </div>
    </div>
  );
}
