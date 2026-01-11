import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { promises } from '@/lib/data';
import { CATEGORIES } from '@/lib/types';
import { 
  TrendingUp, Heart, GraduationCap, Shield, Globe, Users, 
  Leaf, Train, Scale, Landmark, Wheat, Laptop, Home, 
  HandHeart, Trophy, Briefcase 
} from 'lucide-react';

const iconMap: Record<string, any> = {
  TrendingUp, Heart, GraduationCap, Shield, Globe, Users,
  Leaf, Train, Scale, Landmark, Wheat, Laptop, Home,
  HandHeart, Trophy, Briefcase
};

const Categories = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-surface-muted border-b border-border/50">
          <div className="container-wide py-8 md:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Kategorijas
              </h1>
              <p className="text-muted-foreground">
                Pārlūkojiet solījumus pēc politikas jomas
              </p>
            </motion.div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-8 md:py-12">
          <div className="container-wide">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {CATEGORIES.map((category, index) => {
                const categoryPromises = promises.filter(p => p.category === category.id);
                const keptCount = categoryPromises.filter(p => p.status === 'kept').length;
                const brokenCount = categoryPromises.filter(p => p.status === 'broken').length;
                const inProgressCount = categoryPromises.filter(p => p.status === 'in-progress').length;
                const total = categoryPromises.length;
                
                const Icon = iconMap[category.icon] || TrendingUp;

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.03 }}
                  >
                    <Link to={`/categories/${category.id}`}>
                      <Card className="group overflow-hidden border-border/50 hover:shadow-elevated hover:border-accent/50 transition-all duration-300 h-full">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                              <Icon className="h-6 w-6" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">
                              {total} solījumi
                            </span>
                          </div>
                          
                          <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors mb-1">
                            {category.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-1">
                            {category.nameLv}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                            {category.description}
                          </p>

                          {/* Mini Stats */}
                          {total > 0 && (
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-status-kept">{keptCount} izpildīti</span>
                              <span className="text-status-progress">{inProgressCount} procesā</span>
                              <span className="text-status-broken">{brokenCount} lauzti</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Categories;
