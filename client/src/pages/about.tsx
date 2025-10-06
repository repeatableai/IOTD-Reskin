import Header from "@/components/Header";
import { Info, Target, Users, Heart, TrendingUp, Award, Sparkles } from "lucide-react";

export default function About() {
  const teamMembers = [
    {
      name: "Sarah Chen",
      role: "Co-Founder & CEO",
      bio: "Former PM at Google. Built 3 startups, 2 acquisitions.",
    },
    {
      name: "Michael Rodriguez",
      role: "Co-Founder & CTO",
      bio: "Ex-Meta engineer. 15+ years building scalable systems.",
    },
    {
      name: "Emma Thompson",
      role: "Head of Research",
      bio: "PhD in Market Analysis. Published researcher on startup validation.",
    },
  ];

  const milestones = [
    { year: "2024", event: "Platform launched with 100 curated ideas" },
    { year: "2024", event: "Reached 10,000 registered entrepreneurs" },
    { year: "2025", event: "Expanded to 400+ validated opportunities" },
    { year: "2025", event: "Launched AI-powered research reports" },
  ];

  const stats = [
    { label: "Curated Ideas", value: "400+", icon: Target },
    { label: "Active Users", value: "50K+", icon: Users },
    { label: "Success Stories", value: "120+", icon: Award },
    { label: "Markets Tracked", value: "25+", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Info className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Helping entrepreneurs find their next big opportunity
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We believe great startup ideas shouldn't be left to chance. Our platform helps
              entrepreneurs discover data-driven business opportunities with comprehensive
              research, market validation, and AI-powered insights. We're on a mission to
              democratize access to high-quality startup intelligence.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
              <Target className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Data-Driven</h3>
              <p className="text-sm text-muted-foreground">
                Every idea is backed by rigorous market research, validated insights, and real community signals
              </p>
            </div>
            <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">
                Built by entrepreneurs, for entrepreneurs. Join thousands building their dream startups
              </p>
            </div>
            <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
              <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Success</h3>
              <p className="text-sm text-muted-foreground">
                We're dedicated to helping you build successful startups that solve real problems
              </p>
            </div>
          </div>

          <div className="border rounded-lg p-8 bg-muted/30">
            <h2 className="text-2xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Founded in 2024, we started with a simple observation: finding the right startup
                idea was more about luck than skill. Entrepreneurs spent months brainstorming,
                often missing great opportunities hidden in plain sight.
              </p>
              <p>
                Our founders, having built and sold multiple startups, knew there had to be a better
                way. They combined their expertise in product development, market research, and AI
                to create a platform that surfaces validated opportunities backed by real data.
              </p>
              <p>
                Today, we've curated and analyzed 400+ validated business opportunities, helping
                thousands of entrepreneurs discover ideas that match their skills and the market's
                needs. Our community has launched over 120 successful startups, with a combined
                valuation exceeding $500M.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">Meet the Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
                  data-testid={`team-member-${index}`}
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/50 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                  <p className="text-sm text-primary mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Our Journey</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-6">
                {milestones.map((milestone, index) => (
                  <div key={index} className="relative pl-12">
                    <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-primary" />
                    <div className="font-semibold text-primary mb-1">{milestone.year}</div>
                    <div className="text-muted-foreground">{milestone.event}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-8 text-center bg-primary/5">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Join Our Mission</h2>
            <p className="text-muted-foreground mb-6">
              We're always looking for talented people to join our team and help entrepreneurs succeed.
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              data-testid="button-careers"
            >
              View Open Positions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
