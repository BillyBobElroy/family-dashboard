"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-50 to-pink-50 py-20 px-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          A Better Way to Organize Family Life
        </h1>
        <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-6">
          Calendar, chores, lists, and daily check-ins — all in one dashboard your whole family will actually enjoy using.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/signup"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Get Started
          </Link>
          <a
            href="#demo"
            className="text-blue-600 hover:underline text-base font-medium"
          >
            Tour the Dashboard
          </a>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Shared Calendar",
              desc: "Color-coded, family-friendly scheduling with automatic reminders.",
              icon: "📅",
            },
            {
              title: "Chores & Tasks",
              desc: "Assign, track, and complete daily responsibilities with ease.",
              icon: "✅",
            },
            {
              title: "Smart Lists",
              desc: "Groceries, packing, to-dos — all lists in one place.",
              icon: "📝",
            },
            {
              title: "Profiles & Progress",
              desc: "Each member gets their own color, avatar, and tracker.",
              icon: "👤",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-gray-50 rounded-xl shadow p-6 text-center hover:shadow-md transition"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-blue-50 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">See How It Works</h2>
        <p className="mb-8 text-gray-600">
          A quick glance at what makes our dashboard powerful and simple.
        </p>
        <div className="max-w-5xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {["calendar.png", "tasks.png", "lists.png"].map((src, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-4">
              <Image
                src={`/${src}`}
                alt="Dashboard preview"
                width={400}
                height={250}
                className="rounded-lg object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Strip */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { icon: "👨‍👩‍👧", label: "Family-first design" },
            { icon: "⏰", label: "Daily progress" },
            { icon: "🧹", label: "Reduce mental load" },
            { icon: "🌈", label: "Fully personalized" },
          ].map((b) => (
            <div key={b.label}>
              <div className="text-3xl mb-2">{b.icon}</div>
              <p className="text-sm font-medium text-gray-700">{b.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Free Plan Section */}
      <section className="py-16 px-6 bg-yellow-50 text-center">
        <h3 className="text-2xl font-bold mb-3">Free for families of 4 or fewer</h3>
        <p className="text-gray-700 mb-6">No credit card required. Upgrade anytime.</p>
        <Link
          href="/signup"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
        >
          Create Your Dashboard
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-gray-100 text-sm text-gray-600 text-center">
        <div className="mb-3">
          <Link href="/about" className="hover:underline mx-2">
            About
          </Link>
          <Link href="/privacy" className="hover:underline mx-2">
            Privacy
          </Link>
          <Link href="/contact" className="hover:underline mx-2">
            Contact
          </Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Family Dashboard. All rights reserved.</p>
      </footer>
    </main>
  );
}
