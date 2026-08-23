"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

const helpTopics = [
  {
    id: "bookings",
    icon: CalendarDays,
    title: "Bookings",
    description: "Get help with booking requests and reservations.",
    questions: [
      {
        question: "How do bookings work?",
        answer:
          "When you submit a booking request, the business receives your request and can review it. You can keep track of your booking activity from the Bookings section.",
      },
      {
        question: "Where can I see my bookings?",
        answer:
          "Your upcoming and past booking activity is available in the Bookings section of MetroVybe.",
      },
      {
        question: "What should I do if I need help with a booking?",
        answer:
          "Contact the business directly when possible. If you still need assistance, use the support option below and include the relevant booking details.",
      },
    ],
  },
  {
    id: "saved",
    icon: Heart,
    title: "Saved places",
    description: "Manage places you've saved for later.",
    questions: [
      {
        question: "How do I save a place?",
        answer:
          "Tap the save or heart icon on a listing to add it to your saved places.",
      },
      {
        question: "How do I remove a saved place?",
        answer:
          "Open your Saved places and remove any listing you no longer want to keep.",
      },
    ],
  },
  {
    id: "explore",
    icon: MapPin,
    title: "Explore MetroVybe",
    description: "Find and discover services near you.",
    questions: [
      {
        question: "How can I discover nearby services?",
        answer:
          "Use Explore to browse available places and services around your city and discover what fits your needs.",
      },
      {
        question: "Why can't I find a service?",
        answer:
          "Availability depends on the businesses and listings currently active in your area. Try browsing another category or location.",
      },
    ],
  },
  {
    id: "notifications",
    icon: Bell,
    title: "Notifications",
    description: "Understand alerts and notification preferences.",
    questions: [
      {
        question: "What notifications will I receive?",
        answer:
          "MetroVybe may notify you about important account activity, bookings, updates, and other relevant activity.",
      },
      {
        question: "How do I manage notifications?",
        answer:
          "You can manage your notification preferences from your account settings.",
      },
    ],
  },
  {
    id: "security",
    icon: ShieldCheck,
    title: "Account & security",
    description: "Keep your account secure and manage your details.",
    questions: [
      {
        question: "How do I change my password?",
        answer:
          "Go to your account Security settings to update your password and manage account protection.",
      },
      {
        question: "How can I keep my account secure?",
        answer:
          "Use a strong password, avoid sharing your login details, and review your active sessions regularly.",
      },
      {
        question: "What if I notice unusual activity?",
        answer:
          "Secure your account by changing your password and reviewing your active sessions as soon as possible.",
      },
    ],
  },
];

export default function HelpPage() {
  const [openTopic, setOpenTopic] = useState<string | null>("bookings");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  return (
    <div className="page help-page">
      <Header />

      <main className="help-main">
        <div className="help-shell">
          <Link href="/profile/settings" className="help-back">
            <ArrowLeft size={18} />
            <span>Back to settings</span>
          </Link>

          <header className="help-hero">
            <span className="help-eyebrow">SUPPORT</span>
            <h1>How can we help?</h1>
            <p>Find quick answers and get the help you need with MetroVybe.</p>
          </header>

          <section className="help-intro-card">
            <div className="help-intro-icon">
              <CircleHelp size={24} />
            </div>
            <div>
              <span className="help-section-label">METROVYBE HELP CENTER</span>
              <h2>We're here to help you.</h2>
              <p>
                Choose a topic below to find answers to common questions. Everything
                you need is right here.
              </p>
            </div>
          </section>

          <section className="help-topics-section">
            <div className="help-section-heading">
              <span className="help-section-label">HELP TOPICS</span>
              <h2>What do you need help with?</h2>
            </div>

            <div className="help-topics">
              {helpTopics.map((topic) => {
                const Icon = topic.icon;
                const isOpen = openTopic === topic.id;

                return (
                  <article
                    key={topic.id}
                    className={`help-topic ${isOpen ? "help-topic-open" : ""}`}
                  >
                    <button
                      type="button"
                      className="help-topic-trigger"
                      onClick={() =>
                        setOpenTopic(isOpen ? null : topic.id)
                      }
                      aria-expanded={isOpen}
                    >
                      <span className="help-topic-icon">
                        <Icon size={21} strokeWidth={2.2} />
                      </span>

                      <span className="help-topic-copy">
                        <strong>{topic.title}</strong>
                        <small>{topic.description}</small>
                      </span>

                      <ChevronDown
                        className="help-topic-chevron"
                        size={20}
                      />
                    </button>

                    {isOpen && (
                      <div className="help-topic-content">
                        {topic.questions.map((item, index) => {
                          const questionId = `${topic.id}-${index}`;
                          const questionOpen = openQuestion === questionId;

                          return (
                            <div
                              className={`help-question ${
                                questionOpen ? "help-question-open" : ""
                              }`}
                              key={questionId}
                            >
                              <button
                                type="button"
                                className="help-question-trigger"
                                onClick={() =>
                                  setOpenQuestion(
                                    questionOpen ? null : questionId
                                  )
                                }
                              >
                                <span>{item.question}</span>
                                <ChevronDown size={17} />
                              </button>

                              {questionOpen && (
                                <p className="help-question-answer">
                                  {item.answer}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <section className="help-contact-card">
            <div className="help-contact-icon">
              <MessageCircle size={23} />
            </div>

            <div className="help-contact-copy">
              <span className="help-section-label">STILL NEED HELP?</span>
              <h2>Contact MetroVybe support</h2>
              <p>
                Can't find what you're looking for? Our team will be happy to
                help you.
              </p>
            </div>

            <button
              type="button"
              className="help-contact-button"
              onClick={() =>
                (window.location.href =
                  "mailto:support@metrovybe.com?subject=MetroVybe Support Request")
              }
            >
              Contact support
            </button>
          </section>
        </div>
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
