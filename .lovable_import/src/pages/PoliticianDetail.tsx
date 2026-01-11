import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StatusBadge } from '@/components/StatusBadge';
import { PartyBadge } from '@/components/PartyBadge';
import { PromiseCard } from '@/components/PromiseCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPoliticianById, getPartyById, getPromisesByPolitician } from '@/lib/data';
import { PromiseStatus, STATUS_CONFIG } from '@/lib/types';
import { ArrowLeft, CheckCircle2, Clock, XCircle, CircleDot, HelpCircle } from 'lucide-react';

const STATUSES: PromiseStatus[] = ['kept', 'partially-kept', 'in-progress', 'broken', 'not-rated'];

const PoliticianDetail = () => {
  const { id } = useParams<{ id: string }>();
  const politician = id ? getPoliticianById(id) : undefined;
  
  if (!politician) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Politiķis nav atrasts</h1>
            <Link to="/politicians">
              <Button>Atpakaļ uz politiķiem</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const party = getPartyById(politician.partyId);
  const politicianPromises = getPromisesByPolitician(politician.id);
  
  const stats = {
    total: politicianPromises.length,
    kept: politicianPromises.filter(p => p.status === 'kept').length,
    partiallyKept: politicianPromises.filter(p => p.status === 'partially-kept').length,
    inProgress: politicianPromises.filter(p => p.status === 'in-progress').length,
    broken: politicianPromises.filter(p => p.status === 'broken').length,
    notRated: politicianPromises.filter(p => p.status === 'not-rated').length,
  };

  const statCards = [
    { status: 'kept' as PromiseStatus, count: stats.kept, icon: CheckCircle2, color: 'text-status-kept', bg: 'bg-status-kept-bg' },
    { status: 'partially-kept' as PromiseStatus, count: stats.partiallyKept, icon: CircleDot, color: 'text-status-partially', bg: 'bg-status-partially-bg' },
    { status: 'in-progress' as PromiseStatus, count: stats.inProgress, icon: Clock, color: 'text-status-progress', bg: 'bg-status-progress-bg' },
    { status: 'broken' as PromiseStatus, count: stats.broken, icon: XCircle, color: 'text-status-broken', bg: 'bg-status-broken-bg' },
    { status: 'not-rated' as PromiseStatus, count: stats.notRated, icon: HelpCircle, color: 'text-status-unrated', bg: 'bg-status-unrated-bg' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-surface-muted border-b border-border/50">
          <div className="container-wide py-4">
            <Link 
              to="/politicians" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Atpakaļ uz politiķiem
            </Link>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-surface-muted border-b border-border/50">
          <div className="container-wide py-8 md:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col md:flex-row items-start gap-6"
            >
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-lg">
                <AvatarImage src={politician.photoUrl} alt={politician.name} />
                <AvatarFallback className="text-2xl">
                  {politician.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    {politician.name}
                  </h1>
                  {politician.isInOffice ? (
                    <span className="px-3 py-1 bg-status-kept-bg text-status-kept text-sm font-medium rounded-full">
                      Amatā
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-muted text-muted-foreground text-sm font-medium rounded-full">
                      Bijušais
                    </span>
                  )}
                </div>
                <p className="text-lg text-muted-foreground mb-4">
                  {politician.role}
                </p>
                {party && <PartyBadge party={party} size="md" showFullName />}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-8 border-b border-border/50">
          <div className="container-wide">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.status}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Card className="border-border/50">
                      <CardContent className="p-4 text-center">
                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${stat.bg} mb-2`}>
                          <Icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <div className="text-2xl font-bold text-foreground">{stat.count}</div>
                        <div className="text-xs text-muted-foreground">{STATUS_CONFIG[stat.status].label}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Progress Bar */}
            {stats.total > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mt-6"
              >
                <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                  {stats.kept > 0 && (
                    <div 
                      className="h-full bg-status-kept transition-all duration-500"
                      style={{ width: `${(stats.kept / stats.total) * 100}%` }}
                    />
                  )}
                  {stats.partiallyKept > 0 && (
                    <div 
                      className="h-full bg-status-partially transition-all duration-500"
                      style={{ width: `${(stats.partiallyKept / stats.total) * 100}%` }}
                    />
                  )}
                  {stats.inProgress > 0 && (
                    <div 
                      className="h-full bg-status-progress transition-all duration-500"
                      style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
                    />
                  )}
                  {stats.broken > 0 && (
                    <div 
                      className="h-full bg-status-broken transition-all duration-500"
                      style={{ width: `${(stats.broken / stats.total) * 100}%` }}
                    />
                  )}
                  {stats.notRated > 0 && (
                    <div 
                      className="h-full bg-status-unrated transition-all duration-500"
                      style={{ width: `${(stats.notRated / stats.total) * 100}%` }}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Promises */}
        <section className="py-8 md:py-12">
          <div className="container-wide">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Visi solījumi ({stats.total})
            </h2>

            {politicianPromises.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {politicianPromises.map((promise, index) => (
                  <PromiseCard key={promise.id} promise={promise} index={index} />
                ))}
              </div>
            ) : (
              <Card className="border-border/50">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Šim politiķim nav reģistrētu solījumu.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PoliticianDetail;
