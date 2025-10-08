import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import icon from "@/icon.png";

const Footer = () => {
  return (
    <section
      aria-label="Informasi Kantor Wilayah Kementerian Hukum Bali"
      className="my-6 px-4 xl:px-10 bg-(--brand-navy) text-(--brand-foreground)"
    >
      <div className="grid grid-cols-1 gap-8 p-6 md:grid-cols-12 md:p-10">
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <img
              src={icon}
              alt="Lambang Kementerian Hukum dan HAM"
              className="h-12 w-12 shrink-0 rounded"
            />
            <h1 className="text-pretty text-xl font-semibold leading-tight md:text-2xl">
              Kantor Wilayah Kementerian Hukum Bali
            </h1>
          </div>

          <address className="not-italic leading-relaxed text-md md:text-sm">
            Jalan Raya Puputan Niti Mandala Renon, Dangin Puri Klod, Denpasar
            Timur, Gg. Pinang No.64, Dangin Puri Klod, Kec. Denpasar Tim., Kota
            Denpasar, Bali 80234
          </address>

          <p className="text-md md:text-sm">(0361) 224856</p>
        </div>

        <div className="md:col-span-3">
          <ul className="flex flex-col gap-4" aria-label="Akun media sosial">
            <li className="flex items-center gap-3">
              <Instagram className="h-6 w-6 " aria-hidden="true" />
              <span className="text-md md:text-sm">kemenkumbali</span>
            </li>
            <li className="flex items-center gap-3">
              <Twitter className="h-6 w-6 " aria-hidden="true" />
              <span className="text-md md:text-sm">kemenkumbali</span>
            </li>
            <li className="flex items-center gap-3">
              <Facebook className="h-6 w-6 " aria-hidden="true" />
              <span className="text-md md:text-sm">kemenkumbali</span>
            </li>
            <li className="flex items-center gap-3">
              <Youtube className="h-6 w-6 " aria-hidden="true" />
              <span className="text-md md:text-sm">Kanwil Kemenkum Bali</span>
            </li>
          </ul>
        </div>

        <nav className="md:col-span-2" aria-label="Navigasi utama">
          <ul className="flex flex-col gap-4 text-right md:text-left">
            <li>
              <Link
                to="/"
                className="text-md md:text-sm focus-visible:outline-none focus-visible:ring-2 hover:underline"
              >
                Beranda
              </Link>
            </li>
            <li>
              <Link
                to="/sentra-ki-dashboard"
                className="text-md md:text-sm focus-visible:outline-none focus-visible:ring-2 hover:underline"
              >
                Sentra KI
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="text-md md:text-sm focus-visible:outline-none focus-visible:ring-2 hover:underline"
              >
                Masuk
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </section>
  );
};

export default Footer;
