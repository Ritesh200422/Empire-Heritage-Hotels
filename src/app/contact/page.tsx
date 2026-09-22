export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-serif font-bold text-[#4a1c1c] mb-6">Contact Us</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#4a1c1c] mb-4">Get in Touch</h2>
          <p className="text-slate-600 mb-8">
            We're here to help you plan your perfect stay or dining experience. Reach out to us through any of the channels below.
          </p>
          <div className="space-y-4 text-slate-700">
            <p><strong>Address:</strong> 123 Heritage Lane, City Center</p>
            <p><strong>Phone:</strong> +91 98765 43210</p>
            <p><strong>Email:</strong> reservations@empireheritage.demo</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input type="text" className="w-full px-4 py-2 border rounded-md" placeholder="Your Name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" className="w-full px-4 py-2 border rounded-md" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
              <textarea className="w-full px-4 py-2 border rounded-md" rows={4} placeholder="How can we help?"></textarea>
            </div>
            <a
              href="mailto:reservations@empireheritage.demo?subject=Guest%20enquiry"
              className="inline-flex bg-[#b8860b] text-white px-6 py-2 rounded-md hover:bg-[#997300]"
            >
              Send Message
            </a>
          </form>
        </div>
      </div>
    </div>
  );
}
