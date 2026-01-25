import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getPromiseStats } from '@/lib/data';
import { motion } from 'framer-motion';

const COLORS = {
  kept: 'hsl(160, 84%, 39%)',
  partiallyKept: 'hsl(38, 92%, 50%)',
  pending: 'hsl(217, 91%, 60%)',
  broken: 'hsl(350, 89%, 60%)',
  cancelled: 'hsl(215, 16%, 47%)',
};

export const StatsPieChart = () => {
  const stats = getPromiseStats();

  const data = [
    { name: 'Izpildīti', value: stats.kept, color: COLORS.kept },
    { name: 'Daļēji izpildīti', value: stats.partiallyKept, color: COLORS.partiallyKept },
    { name: 'Gaida izpildi', value: stats.pending, color: COLORS.pending },
    { name: 'Lauzti', value: stats.broken, color: COLORS.broken },
    { name: 'Atcelti', value: stats.cancelled, color: COLORS.cancelled },
  ].filter(d => d.value > 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative"
    >
      <div className="w-64 h-64 mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const item = payload[0].payload;
                return (
                  <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-lg font-bold text-foreground">{item.value}</p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Solījumi</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-muted-foreground">
              {item.name} ({item.value})
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
