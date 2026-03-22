import { Button } from "@/components/ui/button";
import { features, steps } from "./data/data";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="py-24 text-center">
        <div className="container max-w-5xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            The Intelligence Layer for{" "}
            <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Modern Teams
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Lumina-HQ is an agentic workspace that analyzes, extracts, and
            automates your organizational knowledge with enterprise-grade isolation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="px-10 h-14 text-lg shadow-lg shadow-blue-200"
            >
              <Link href="/sign-up">
                Deploy Your Workspace <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="px-10 h-14 text-lg"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="py-24 bg-slate-50/50 border-y border-slate-100"
      >
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            Enterprise-Ready Intelligence
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <CardHeader>
                  <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-xl mb-4 w-fit">
                    <div className="text-blue-600">
                      <feature.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Zero-Config Onboarding</h2>
          <div className="space-y-6 max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-5 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-200 transition-colors"
              >
                <div className="shrink-0 h-10 w-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{step.title}</h3>
                  <p className="text-slate-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container max-w-4xl mx-auto bg-slate-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <h2 className="text-4xl font-bold mb-6">
            Ready to unlock your documents?
          </h2>
          <p className="text-slate-400 mb-10 max-w-xl mx-auto text-lg">
            Join forward-thinking teams using Lumina-HQ to turn
            static files into strategic assets.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="px-10 h-14 text-lg"
          >
            <Link href="/sign-up">Get Started for Free</Link>
          </Button>
          <p className="text-sm text-slate-500 mt-6">
            No credit card required • 14-day free trial • Multi-tenant ready
          </p>
        </div>
      </section>
    </>
  );
}
