import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, Instagram, Facebook, MessageCircle, Clock } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Telepon',
      content: '+62 24 1234 5678',
      description: 'Senin - Jumat, 08:00 - 17:00 WIB'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'info@wisatajateng.com',
      description: 'Respon dalam 24 jam'
    },
    {
      icon: MapPin,
      title: 'Alamat',
      content: 'Semarang, Jawa Tengah',
      description: 'Indonesia'
    },
    {
      icon: Clock,
      title: 'Jam Operasional',
      content: 'Senin - Jumat',
      description: '08:00 - 17:00 WIB'
    }
  ];

  const faqs = [
    {
      question: 'Bagaimana cara memesan paket wisata?',
      answer: 'Anda bisa memesan paket wisata melalui website kami dengan memilih paket yang diinginkan, mengisi formulir booking, dan menyelesaikan pembayaran.'
    },
    {
      question: 'Apakah bisa custom paket wisata?',
      answer: 'Ya, kami menyediakan fitur custom trip di mana Anda bisa memilih destinasi, durasi, dan akomodasi sesuai kebutuhan Anda.'
    },
    {
      question: 'Metode pembayaran apa yang tersedia?',
      answer: 'Kami menerima pembayaran melalui transfer bank, e-wallet, dan kartu kredit. Pembayaran harus dilakukan sebelum tanggal keberangkatan.'
    },
    {
      question: 'Bagaimana jika perlu membatalkan pesanan?',
      answer: 'Pembatalan dapat dilakukan sesuai dengan kebijakan pembatalan yang berlaku. Silakan hubungi tim kami untuk informasi lebih lanjut.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=80"
            alt="Destinasi Wisata Jawa Tengah"
            className="h-full w-full object-cover opacity-60"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-900/40" />
        </div>
        <div className="relative container py-28 md:py-36">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-400">Contact</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Hubungi Kami
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-200 sm:text-xl">
              Tim kami siap membantu Anda merencanakan perjalanan impian ke Jawa Tengah.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="bg-slate-50 py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Get in Touch</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Informasi Kontak</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {contactInfo.map((info) => {
              const Icon = info.icon;
              return (
                <div key={info.title} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{info.title}</h3>
                  <p className="mt-2 text-sm font-medium text-indigo-600">{info.content}</p>
                  <p className="mt-1 text-sm text-slate-500">{info.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="bg-white py-20">
        <div className="container grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Send Message</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Kirim Pesan</h2>
            <p className="mt-4 text-lg text-slate-600">
              Isi formulir di bawah ini dan tim kami akan segera menghubungi Anda.
            </p>

            <div className="mt-8 flex gap-3">
              <a href="#" className="rounded-full border border-slate-200 p-3 text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-full border border-slate-200 p-3 text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-full border border-slate-200 p-3 text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            {submitStatus === 'success' ? (
              <div className="text-center py-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Send className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">Pesan Terkirim!</h3>
                <p className="mt-2 text-slate-600">Terima kasih telah menghubungi kami. Kami akan segera merespon pesan Anda.</p>
                <button
                  onClick={() => setSubmitStatus(null)}
                  className="mt-6 rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Kirim Pesan Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Nama Lengkap</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Nama Anda"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Subjek</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Subjek pesan Anda"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Pesan</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    placeholder="Ceritakan kebutuhan perjalanan Anda"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-50 py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">FAQ</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Pertanyaan yang Sering Diajukan</h2>
          </div>
          <div className="mt-12 mx-auto max-w-3xl space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">{faq.question}</h3>
                <p className="mt-2 text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-white py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Location</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Lokasi Kami</h2>
          </div>
          <div className="mt-12 rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.897941221717!2d110.42031231477492!3d-6.966467994972698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708b4d8f1f5c5d%3A0x6b5f5f5f5f5f5f5f!2sSemarang%2C%20Central%20Java!5e0!3m2!1sen!2sid!4v1620000000000!5m2!1sen!2sid"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="WisataJateng Location"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
