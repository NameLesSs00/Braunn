import { motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { TabNav } from './components/TabNav'
import { StatCard, defaultStats } from './components/StatCard'
import { PeriodSelector } from './components/PeriodSelector'
import { RevenueTrendChart } from './components/RevenueTrendChart'
import { RevenueByBookingType } from './components/RevenueByBookingType'
import { TopRevenueSources } from './components/TopRevenueSources'

// Define animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: 'spring', 
      stiffness: 300, 
      damping: 24 
    } 
  },
}

export function SalesRevenueDashboardPage() {
  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} viewport={{ once: true, amount: 0.3 }} whileInView="visible" initial="hidden">
        <TabNav />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between px-1"
        viewport={{ once: true, amount: 0.3 }}
        whileInView="visible"
        initial="hidden"
      >
        <h2 className="text-lg font-semibold text-slate-800">Sales Overview</h2>
        <PeriodSelector />
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {defaultStats.map((stat) => (
          <motion.div 
            key={stat.title}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            viewport={{ once: true, amount: 0.25 }}
            whileInView="visible"
            initial="hidden"
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <motion.div
        variants={itemVariants}
        viewport={{ once: true, amount: 0.25 }}
        whileInView="visible"
        initial="hidden"
      >
        <RevenueTrendChart />
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          variants={itemVariants}
          viewport={{ once: true, amount: 0.25 }}
          whileInView="visible"
          initial="hidden"
        >
          <RevenueByBookingType />
        </motion.div>
        <motion.div
          variants={itemVariants}
          viewport={{ once: true, amount: 0.25 }}
          whileInView="visible"
          initial="hidden"
        >
          <TopRevenueSources />
        </motion.div>
      </div>
    </motion.div>
  )
}
