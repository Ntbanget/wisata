import React from 'react';
import { Shield, Sparkles, Users, Compass, Target, Heart, Award, Globe } from 'lucide-react';

const AboutPage = () => {
  const features = [
    {
      icon: Shield,
      title: 'Terpercaya',
      description: 'Paket wisata yang aman, legal, dan dikelola dengan transparansi harga. Kami bekerja sama dengan penyedia layanan terpercaya di seluruh Jawa Tengah.'
    },
    {
      icon: Sparkles,
      title: 'Rencana Cerdas',
      description: 'Sistem rekomendasi AI membantu memilih pengalaman terbaik sesuai budget dan durasi perjalanan Anda.'
    },
    {
      icon: Users,
      title: 'Panduan Lokal',
      description: 'Pengalaman autentik dari destinasi terbaik dan guide yang memahami budaya setempat dengan mendalam.'
    },
    {
      icon: Compass,
      title: 'Booking Mudah',
      description: 'Proses booking sederhana, pembayaran jelas, dan notifikasi real-time untuk perjalanan Anda.'
    }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Pelanggan Pertama',
      description: 'Kami selalu mengutamakan kepuasan dan kenyamanan pelanggan dalam setiap layanan.'
    },
    {
      icon: Target,
      title: 'Profesional',
      description: 'Tim kami berpengalaman dan berdedikasi untuk memberikan layanan terbaik.'
    },
    {
      icon: Globe,
      title: 'Inovasi',
      description: 'Terus berinovasi dalam teknologi dan layanan untuk pengalaman wisata yang lebih baik.'
    },
    {
      icon: Award,
      title: 'Kualitas',
      description: 'Menjamin kualitas layanan dan akomodasi untuk setiap paket wisata yang kami tawarkan.'
    }
  ];

  const stats = [
    { number: '20+', label: 'Destinasi' },
    { number: '5000+', label: 'Wisatawan Puas' },
    { number: '50+', label: 'Partner Lokal' },
    { number: '4.9', label: 'Rating Rata-rata' }
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
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-400">About Us</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Tentang WisataJateng
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-200 sm:text-xl">
              Platform pariwisata modern yang menghubungkan Anda dengan keindahan Jawa Tengah melalui pengalaman wisata yang tak terlupakan.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl font-bold text-indigo-600 sm:text-5xl">{stat.number}</p>
                <p className="mt-2 text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-slate-50 py-20">
        <div className="container grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="overflow-hidden rounded-3xl shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?auto=format&fit=crop&w=1200&q=80" 
              alt="Wisata Jateng" 
              className="h-full w-full object-cover" 
              loading="lazy" 
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Our Story</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Perjalanan Jawa Tengah yang terasa personal, aman, dan penuh kenangan.</h2>
            <p className="mt-5 text-lg text-slate-600">
              WisataJateng didirikan dengan visi untuk mempermudah wisatawan lokal maupun internasional mengeksplorasi keindahan Jawa Tengah. Kami percaya bahwa setiap perjalanan harusnya mudah direncanakan, transparan harganya, dan memberikan pengalaman yang autentik.
            </p>
            <p className="mt-4 text-lg text-slate-600">
              Dari candi bersejarah seperti Borobudur, keindahan alam Dieng, hingga pantai-pantai indah di pesisir utara, kami telah merangkum destinasi terbaik Jawa Tengah dalam paket wisata yang fleksibel dan terjangkau.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Why Choose Us</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Keunggulan WisataJateng</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 flex-shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                    <p className="mt-2 text-slate-600">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-slate-50 py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Our Values</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Nilai yang Kami Pegang</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{value.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 py-20 text-white">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Siap untuk memulai petualangan Anda?</h2>
          <p className="mt-4 text-lg text-indigo-100">
            Jelajahi paket wisata terbaik kami dan rencanakan perjalanan impian Anda ke Jawa Tengah.
          </p>
          <button 
            onClick={() => window.location.href = '/packages'}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 font-semibold text-indigo-600 shadow-lg transition hover:bg-indigo-50"
          >
            Lihat Paket Wisata
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
