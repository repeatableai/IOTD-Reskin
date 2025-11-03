import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Idea } from '@shared/schema';
import { 
  CheckCircle, 
  Award, 
  Target, 
  Lightbulb,
  TrendingUp,
  Users,
  Code,
  Briefcase
} from 'lucide-react';

interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple';
  options: { value: string; label: string; icon?: any }[];
}

const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 'experience',
    question: 'What best describes your background?',
    type: 'single',
    options: [
      { value: 'technical', label: 'Technical (Developer/Engineer)', icon: Code },
      { value: 'business', label: 'Business (Marketing/Sales)', icon: Briefcase },
      { value: 'product', label: 'Product Management', icon: Lightbulb },
      { value: 'mixed', label: 'Mixed Background', icon: Users },
    ],
  },
  {
    id: 'skills',
    question: 'What are your strongest skills?',
    type: 'multiple',
    options: [
      { value: 'coding', label: 'Coding & Development', icon: Code },
      { value: 'design', label: 'UI/UX Design', icon: Target },
      { value: 'marketing', label: 'Marketing & Growth', icon: TrendingUp },
      { value: 'sales', label: 'Sales & Business Development', icon: Briefcase },
      { value: 'operations', label: 'Operations & Management', icon: Users },
      { value: 'fundraising', label: 'Fundraising & Networking', icon: Award },
    ],
  },
  {
    id: 'time',
    question: 'How much time can you dedicate weekly?',
    type: 'single',
    options: [
      { value: '5-10', label: '5-10 hours (Side Project)' },
      { value: '10-20', label: '10-20 hours (Part-time)' },
      { value: '20-40', label: '20-40 hours (Near Full-time)' },
      { value: '40+', label: '40+ hours (Full-time)' },
    ],
  },
  {
    id: 'budget',
    question: 'Initial budget for your startup?',
    type: 'single',
    options: [
      { value: 'bootstrap', label: 'Bootstrapped ($0-5K)' },
      { value: 'small', label: 'Small Budget ($5K-25K)' },
      { value: 'medium', label: 'Medium Budget ($25K-100K)' },
      { value: 'funded', label: 'Well Funded ($100K+)' },
    ],
  },
  {
    id: 'interests',
    question: 'Which markets interest you most?',
    type: 'multiple',
    options: [
      { value: 'saas', label: 'SaaS & Software' },
      { value: 'ecommerce', label: 'E-commerce & Retail' },
      { value: 'marketplace', label: 'Marketplace & Platforms' },
      { value: 'content', label: 'Content & Media' },
      { value: 'fintech', label: 'Fintech & Finance' },
      { value: 'health', label: 'Health & Wellness' },
    ],
  },
];

export default function FounderFit() {
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionId: string, value: string, isMultiple: boolean) => {
    if (isMultiple) {
      const current = answers[questionId] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      setAnswers({ ...answers, [questionId]: updated });
    } else {
      setAnswers({ ...answers, [questionId]: [value] });
    }
  };

  const handleNext = () => {
    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progress = ((currentQuestion + 1) / assessmentQuestions.length) * 100;
  const currentQ = assessmentQuestions[currentQuestion];
  const currentAnswers = answers[currentQ.id] || [];
  const canProceed = currentAnswers.length > 0;

  // Fetch real ideas from the database
  const { data: ideasData } = useQuery({
    queryKey: ['/api/ideas', { limit: 50 }],
    queryFn: async () => {
      const response = await fetch('/api/ideas?limit=50');
      if (!response.ok) throw new Error('Failed to fetch ideas');
      return response.json();
    },
  });

  const calculateFitScore = (idea: Idea): number => {
    let score = 50;
    
    const experience = answers.experience?.[0];
    const skills = answers.skills || [];
    const time = answers.time?.[0];
    const budget = answers.budget?.[0];
    const interests = answers.interests || [];
    
    // Match by type
    if (idea.type === 'saas' && experience === 'technical') score += 20;
    if (idea.type === 'saas' && skills.includes('coding')) score += 15;
    if (idea.type === 'marketplace' && skills.includes('marketing')) score += 15;
    
    // Match by skills
    if (skills.includes('coding') && idea.executionScore <= 5) score += 10;
    if (skills.includes('marketing') && idea.gtmScore >= 7) score += 10;
    
    // Match by time commitment
    if (time === '40+') score += 10;
    else if (time === '5-10' && idea.executionScore <= 4) score += 10;
    
    // Match by budget
    if (budget === 'funded' && idea.revenuePotentialNum && idea.revenuePotentialNum >= 10000000) score += 10;
    if (budget === 'bootstrap' && idea.executionScore <= 5) score += 10;
    
    // Match by interests
    interests.forEach(interest => {
      if (idea.type.toLowerCase().includes(interest)) score += 5;
    });
    
    // Bonus for high opportunity score
    if (idea.opportunityScore >= 8) score += 5;
    
    return Math.min(score, 100);
  };

  const getMatchedIdeas = () => {
    if (!ideasData?.ideas) return [];
    
    return ideasData.ideas
      .map((idea: Idea) => ({
        ...idea,
        fitScore: calculateFitScore(idea),
        difficulty: idea.executionDifficulty || 'Medium',
        timeToMarket: idea.executionScore <= 4 ? '1-3 months' : idea.executionScore <= 7 ? '3-6 months' : '6-12 months',
      }))
      .sort((a: any, b: any) => b.fitScore - a.fitScore)
      .slice(0, 5); // Top 5 matches
  };

  if (showResults) {
    const sortedIdeas = getMatchedIdeas();

    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h1 className="text-4xl font-bold mb-4" data-testid="text-results-title">
              Your Founder Fit Results
            </h1>
            <p className="text-lg text-muted-foreground">
              Based on your profile, here are the startup solutions that match you best
            </p>
          </div>

          <div className="grid gap-6 mb-8">
            {sortedIdeas.map((idea, index) => (
              <Card 
                key={idea.id} 
                className={index === 0 ? 'border-2 border-primary shadow-lg' : ''}
                data-testid={`card-idea-${idea.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl">{idea.title}</CardTitle>
                        {index === 0 && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                            <Award className="w-3 h-3 mr-1" />
                            Best Match
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-base">{idea.description}</CardDescription>
                    </div>
                    <div className="text-center ml-4">
                      <div className="text-3xl font-bold text-primary" data-testid={`text-fit-score-${idea.id}`}>
                        {idea.fitScore}%
                      </div>
                      <div className="text-sm text-muted-foreground">Fit Score</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
                      <p className="font-semibold">{idea.difficulty}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Time to Market</p>
                      <p className="font-semibold">{idea.timeToMarket}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Match Strength</p>
                    <Progress value={idea.fitScore} className="h-2" />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setLocation(`/idea/${idea.slug}`)}
                      data-testid={`button-view-idea-${idea.id}`}
                    >
                      View Full Idea
                    </Button>
                    <Button variant="outline" onClick={() => setLocation(`/idea/${idea.slug}`)} data-testid={`button-save-${idea.id}`}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <CardContent className="p-8 text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Want More Personalized Matches?</h3>
              <p className="text-muted-foreground mb-4">
                Browse our full database of startup solutions and filter by your preferences
              </p>
              <Button onClick={() => setLocation('/database')} data-testid="button-browse-all">
                Browse All Solutions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-center" data-testid="text-assessment-title">
            Founder Fit Assessment
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-6">
            Answer a few questions to discover startup solutions that match your skills and goals
          </p>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Question {currentQuestion + 1} of {assessmentQuestions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" data-testid="progress-assessment" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl" data-testid="text-question">
              {currentQ.question}
            </CardTitle>
            {currentQ.type === 'multiple' && (
              <CardDescription>Select all that apply</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQ.options.map((option) => {
              const isSelected = currentAnswers.includes(option.value);
              const Icon = option.icon;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(currentQ.id, option.value, currentQ.type === 'multiple')}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  data-testid={`option-${option.value}`}
                >
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-5 h-5 text-primary" />}
                    <span className="font-medium">{option.label}</span>
                    {isSelected && <CheckCircle className="w-5 h-5 ml-auto text-primary" />}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            data-testid="button-previous"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            data-testid="button-next"
          >
            {currentQuestion === assessmentQuestions.length - 1 ? 'See Results' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
