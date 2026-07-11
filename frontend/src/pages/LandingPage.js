import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Star, ArrowRight, Check, Compass, Shield, Sparkles, Phone, Mail, Instagram, Facebook, MessageCircle } from 'lucide-react';
import apiService from '../services/api';
import { formatCurrency, getRatingStars } from '../utils/helpers';
import { selectFeaturedCities } from '../utils/popularCities';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getPackagesFromPackageApiResponse } from '../utils/packageResponse';

const LandingPage = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [budget, setBudget] = useState('');
  const [nights, setNights] = useState(2);
  const [peopleCount, setPeopleCount] = useState('');
  const [vehicleMode, setVehicleMode] = useState('automatic'); // 'automatic' or 'custom'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState({});

  useEffect(() => {
    fetchCities();
    fetchPopularDestinations();
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await apiService.getAllVehicles();
      setVehicles(response.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await apiService.getCities();
      setCities(response.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchPopularDestinations = async () => {
    try {
      const response = await apiService.getPopularDestinations({ limit: 6 });
      setPopularDestinations(response.data);
    } catch (error) {
      console.error('Error fetching popular destinations:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!selectedCity) {
      setError('Please select a city');
      return;
    }

    if (!budget || budget < 10000) {
      setError('Please enter a valid budget (minimum Rp 10,000)');
      return;
    }

    if (vehicleMode === 'custom' && !peopleCount) {
      setError('Please enter number of people for custom vehicle selection');
      return;
    }

    if (vehicleMode === 'custom') {
      // Validate vehicle selection
      const totalCapacity = Object.entries(selectedVehicles).reduce((sum, [vehicleId, quantity]) => {
        const vehicle = vehicles.find(v => v.id === parseInt(vehicleId));
        return sum + (vehicle ? vehicle.capacity * quantity : 0);
      }, 0);

      if (totalCapacity < parseInt(peopleCount)) {
        setError(`Total capacity (${totalCapacity}) is less than number of people (${peopleCount}). Please select more vehicles.`);
        return;
      }

      // Calculate vehicle cost
      const vehicleCost = Object.entries(selectedVehicles).reduce((sum, [vehicleId, quantity]) => {
        const vehicle = vehicles.find(v => v.id === parseInt(vehicleId));
        return sum + (vehicle ? vehicle.price_per_day * quantity * nights : 0);
      }, 0);

      // Store custom vehicle selection in sessionStorage
      sessionStorage.setItem('customVehicleSelection', JSON.stringify({
        selectedVehicles,
        peopleCount: parseInt(peopleCount),
        vehicleCost,
        nights: parseInt(nights)
      }));
    }

    const safeNights = Math.max(1, Math.min(parseInt(nights, 10) || 1, 14));
    const safePeopleCount = Math.max(1, parseInt(peopleCount, 10) || 1);

    setIsLoading(true);
    setError(null);

    try {
      if (vehicleMode === 'automatic') {
        const response = await apiService.generatePackages({
          city_id: selectedCity,
          budget: parseFloat(budget),
          packages_count: 3,
          max_places: 4,
          nights: safeNights
        });

        const payload = response?.data && typeof response.data === 'object' && !Array.isArray(response.data)
          ? response.data
          : response || {};
        const packages = getPackagesFromPackageApiResponse(response);

      if (packages.length === 0) {
        setError('No packages found for your criteria. Try increasing your budget or selecting a different city.');
      } else {
        const snapshot = {
          ...payload,
          packages,
          saved_at: Date.now()
        };

        sessionStorage.setItem('searchResults', JSON.stringify(snapshot));
        sessionStorage.setItem('searchCriteria', JSON.stringify({
          city_id: selectedCity,
          budget: parseFloat(budget),
          nights: safeNights,
          people_count: safePeopleCount,
          peopleCount: safePeopleCount,
          vehicleMode: 'automatic',
          saved_at: Date.now()
        }));
        navigate('/packages');
      }
      } else {
        // Custom vehicle mode - skip package generation and go directly to checkout
        sessionStorage.setItem('searchCriteria', JSON.stringify({
          city_id: selectedCity,
          budget: parseFloat(budget),
          nights: safeNights,
          people_count: safePeopleCount,
          peopleCount: safePeopleCount,
          vehicleMode: 'custom',
          saved_at: Date.now()
        }));
        navigate('/checkout');
      }
    } catch (error) {
      setError('Failed to search packages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVehicleQuantityChange = (vehicleId, quantity) => {
    setSelectedVehicles(prev => ({
      ...prev,
      [vehicleId]: quantity > 0 ? quantity : 0
    }));
  };

  const features = [
    {
      icon: Shield,
      title: 'Terpercaya',
      description: 'Paket wisata yang aman, legal, dan dikelola dengan transparansi harga.'
    },
    {
      icon: Sparkles,
      title: 'Rencana Cerdas',
      description: 'Sistem rekomendasi membantu memilih pengalaman terbaik sesuai budget dan durasi.'
    },
    {
      icon: Users,
      title: 'Panduan Lokal',
      description: 'Pengalaman autentik dari destinasi terbaik dan guide yang memahami budaya setempat.'
    },
    {
      icon: Compass,
      title: 'Booking Mudah',
      description: 'Proses booking sederhana, pembayaran jelas, dan notifikasi real-time untuk perjalanan Anda.'
    }
  ];

  const testimonials = [
    {
      name: 'Rina & Damar',
      role: 'Traveler dari Jakarta',
      quote: 'Paketnya sangat rapi, kami tinggal pilih dan langsung booking. Perjalanan ke Dieng terasa jauh lebih praktis.',
      rating: 5
    },
    {
      name: 'Ayu Pratama',
      role: 'Wisata keluarga',
      quote: 'Kami suka desain website-nya yang nyaman dipakai dan informasi destinasi sangat lengkap.',
      rating: 5
    },
    {
      name: 'Bambang S.',
      role: 'Solo traveler',
      quote: 'Saya suka fitur pilih paket berdasarkan budget. Sangat membantu untuk liburan hemat tapi tetap berkesan.',
      rating: 5
    }
  ];

  const featuredPackages = [
    {
      title: 'Borobudur & Yogyakarta Heritage',
      duration: '3 Hari 2 Malam',
      price: 'Rp 2.450.000',
      badge: 'Populer'
    },
    {
      title: 'Dieng Highland Escape',
      duration: '2 Hari 1 Malam',
      price: 'Rp 1.650.000',
      badge: 'Promo'
    },
    {
      title: 'Jepara Beach Retreat',
      duration: '4 Hari 3 Malam',
      price: 'Rp 3.200.000',
      badge: 'Baru'
    }
  ];

  // Landmark photos per city (Wikimedia Commons thumbnail URLs verified
  // against the MediaWiki API). Falls back to a primary gradient background
  // when a city is missing here or the image fails to load.
  const CITY_LANDMARK_IMAGES = {
    Semarang:    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Lawang_Sewu_Semarang_Indonesia_1.jpg/960px-Lawang_Sewu_Semarang_Indonesia_1.jpg',
    Surakarta:   'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Keraton_Kasunanan_Surakarta_Hadiningrat.jpg/960px-Keraton_Kasunanan_Surakarta_Hadiningrat.jpg',
    Magelang:    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Borobudur-Nothwest-view.jpg/960px-Borobudur-Nothwest-view.jpg',
    Wonosobo:    'https://upload.wikimedia.org/wikipedia/commons/b/b9/Telaga_Warna_Sulpher_lake_in_Dieng_Plateau_%28Indonesia_2009%29.jpg',
    Jepara:      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Pantai_Bandengan_-_Jepara%2C_Indonesia_-_panoramio.jpg/960px-Pantai_Bandengan_-_Jepara%2C_Indonesia_-_panoramio.jpg',
    Salatiga:    'https://upload.wikimedia.org/wikipedia/commons/e/e2/Rawa_Pening_Central_Java.jpg',
    Purwokerto:  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Gunung_Slamet_dan_Pegunungan_Serayu_Selatan_dilihat_dari_Teluk_Penyu.jpg/960px-Gunung_Slamet_dan_Pegunungan_Serayu_Selatan_dilihat_dari_Teluk_Penyu.jpg',
    Pekalongan:  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Pekalongan_light_up_at_night.jpg/960px-Pekalongan_light_up_at_night.jpg',
    Pemalang:    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Pantai_Widuri_Pemalang.jpg/960px-Pantai_Widuri_Pemalang.jpg',
    Kendal:      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Curug_Sewu.jpg/960px-Curug_Sewu.jpg',
    Yogyakarta:  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Jogja_-_Tugu_Monument_%282025%29_-_img_06.jpg/960px-Jogja_-_Tugu_Monument_%282025%29_-_img_06.jpg',
  };
  const CITY_LANDMARK_LABEL = {
    Semarang:    'Lawang Sewu',
    Surakarta:   'Keraton Surakarta',
    Magelang:    'Candi Borobudur',
    Wonosobo:    'Telaga Warna Dieng',
    Jepara:      'Pantai Kartini & Karimunjawa',
    Salatiga:    'Rawa Pening',
    Purwokerto:  'Lokawisata Baturraden',
    Pekalongan:  'Kota Batik',
    Pemalang:    'Pantai Widuri',
    Kendal:      'Curug Sewu',
    Yogyakarta:  'Tugu Yogyakarta',
  };

  const citiesToShow = selectFeaturedCities(cities, 6);

  return (
    <div className="min-h-screen bg-white">
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
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-slate-100 backdrop-blur">
              <Compass className="mr-2 h-4 w-4 text-emerald-400" />
              Jelajahi keindahan Jawa Tengah bersama WisataJateng
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Temukan liburan yang nyaman, penuh petualangan, dan mudah dipesan.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-200 sm:text-xl">
              Dari Borobudur, Dieng, hingga pantai indah, kami membantu Anda merencanakan perjalanan yang sesuai budget dan selera.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => navigate('/packages')} className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700">
                Jelajahi Paket Wisata <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <button onClick={() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20">
                Lihat Destinasi
              </button>
            </div>
            <div className="mt-10 flex flex-wrap gap-4 text-sm text-slate-200">
              <span className="rounded-full bg-white/10 px-3 py-2">20+ Destinasi</span>
              <span className="rounded-full bg-white/10 px-3 py-2">98% Pengguna Puas</span>
              <span className="rounded-full bg-white/10 px-3 py-2">Booking Mudah</span>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="bg-white py-20">
        <div className="container grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="overflow-hidden rounded-3xl shadow-lg">
            <img src="https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?auto=format&fit=crop&w=1200&q=80" alt="Wisata Jateng" className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">About WisataJateng</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Perjalanan Jawa Tengah yang terasa personal, aman, dan penuh kenangan.</h2>
            <p className="mt-5 text-lg text-slate-600">Kami menghadirkan pengalaman perjalanan yang menggabungkan destinasi favorit, paket yang fleksibel, dan sistem booking yang sederhana untuk perjalanan solo, pasangan, maupun keluarga.</p>
            <div className="mt-8 space-y-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="destinations" className="bg-slate-50 py-20">
        <div className="container">
          <div className="flex flex-col gap-3 text-center sm:text-left sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Featured Destinations</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Destinasi favorit yang sudah siap dikunjungi</h2>
            </div>
            <button onClick={() => navigate('/packages')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Lihat Semua Destinasi →</button>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {citiesToShow.map((city) => {
              const lookupKey = CITY_LANDMARK_IMAGES[city.name] ? city.name : (city.name || '').split(' ')[0];
              const landmarkImg = CITY_LANDMARK_IMAGES[lookupKey];
              const landmarkLabel = CITY_LANDMARK_LABEL[lookupKey];
              return (
                <div key={city.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative h-48 overflow-hidden">
                    {landmarkImg ? (
                      <>
                        <img src={landmarkImg} alt={city.name} className="h-full w-full object-cover transition duration-300 hover:scale-105" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 to-transparent" />
                        {landmarkLabel && <span className="absolute bottom-3 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">{landmarkLabel}</span>}
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center bg-indigo-100 text-indigo-600"><MapPin className="h-10 w-10" /></div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-slate-900">{city.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Destinasi dengan suasana khas, kuliner lezat, dan pengalaman yang tak terlupakan.</p>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500"><Star className="h-4 w-4 fill-current" /><span className="text-sm font-semibold text-slate-700">4.8</span></div>
                      <button onClick={() => { setSelectedCity(String(city.id)); setBudget('1500000'); document.getElementById('search-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Explore</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="packages" className="bg-white py-20">
        <div className="container">
          <div className="flex flex-col gap-3 text-center sm:text-left sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Featured Packages</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Paket wisata yang siap mengantarkan Anda ke momen terbaik</h2>
            </div>
            <button onClick={() => navigate('/packages')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Lihat Semua Paket →</button>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {featuredPackages.map((pkg) => (
              <div key={pkg.title} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
                <div className="h-40 bg-gradient-to-br from-indigo-500 via-indigo-600 to-emerald-500" />
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{pkg.badge}</span>
                    <span className="text-sm font-medium text-slate-500">{pkg.duration}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-900">{pkg.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">Termasuk transportasi, penginapan, dan itinerary yang sudah disusun.</p>
                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Mulai dari</p>
                      <p className="text-lg font-semibold text-slate-900">{pkg.price}</p>
                    </div>
                    <button onClick={() => navigate('/packages')} className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Lihat Detail</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Testimonial</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Apa yang dikatakan traveler kami</h2>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-1 text-amber-500">{Array.from({ length: item.rating }).map((_, idx) => <Star key={idx} className="h-4 w-4 fill-current" />)}</div>
                <p className="mt-4 text-base leading-7 text-slate-600">“{item.quote}”</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">{item.name.charAt(0)}</div>
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-white py-20">
        <div className="container grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Contact</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Hubungi tim WisataJateng</h2>
            <p className="mt-4 text-lg text-slate-600">Kami siap membantu merancang perjalanan yang sesuai kebutuhan Anda.</p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-indigo-600" /><span className="text-slate-700">+62 24 1234 5678</span></div>
              <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-indigo-600" /><span className="text-slate-700">info@wisatajateng.com</span></div>
              <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-indigo-600" /><span className="text-slate-700">Semarang, Jawa Tengah</span></div>
            </div>
            <div className="mt-8 flex gap-3">
              <a href="#" className="rounded-full border border-slate-200 p-3 text-slate-700 hover:bg-slate-100"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="rounded-full border border-slate-200 p-3 text-slate-700 hover:bg-slate-100"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="rounded-full border border-slate-200 p-3 text-slate-700 hover:bg-slate-100"><MessageCircle className="h-5 w-5" /></a>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="mb-2 block text-sm font-medium text-slate-700">Nama</label><input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Nama Anda" /></div>
                <div><label className="mb-2 block text-sm font-medium text-slate-700">Email</label><input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Email Anda" /></div>
              </div>
              <div><label className="mb-2 block text-sm font-medium text-slate-700">Pesan</label><textarea rows="5" className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Ceritakan kebutuhan perjalanan Anda"></textarea></div>
              <button className="rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">Kirim Pesan</button>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white">
        <div className="container grid gap-8 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-semibold"><MapPin className="h-5 w-5 text-indigo-400" /> WisataJateng</div>
            <p className="mt-4 text-sm leading-7 text-slate-400">Website pariwisata modern untuk membantu Anda merencanakan perjalanan ke Jawa Tengah dengan mudah dan nyaman.</p>
          </div>
          <div>
            <h3 className="font-semibold">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li><a href="#about" className="hover:text-white">About Us</a></li>
              <li><a href="#destinations" className="hover:text-white">Destinations</a></li>
              <li><a href="#packages" className="hover:text-white">Packages</a></li>
              <li><a href="#contact" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Destinasi Populer</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>Borobudur</li>
              <li>Dieng</li>
              <li>Jepara</li>
              <li>Solo</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Kontak</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>+62 24 1234 5678</li>
              <li>info@wisatajateng.com</li>
              <li>Semarang, Jawa Tengah</li>
            </ul>
          </div>
        </div>
        <div className="container mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-500">© {new Date().getFullYear()} WisataJateng. All rights reserved.</div>
      </section>
    </div>
  );
};

export default LandingPage;
