import React from 'react';
import {
  Package,
  Users,
  User,
  Star,
  AlertCircle
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    // For Donut chart, we calculate percentage if there's a total available
    // But since the tooltip is reused for BarChart (which doesn't have the 32 fixed total)
    // We should only show percentage for Donut. 
    // Let's pass a custom total via payload or just calculate based on the current data array, but it's easier to check if the data has specific properties.
    // However, the prompt specifically provided:
    // <p>({((payload[0].value / 32) * 100).toFixed(0)}%)</p>
    // So we'll accept a total prop in the tooltip or just calculate it dynamically.
    // To make it generic as requested: "Custom Tooltip: sama dengan Chart A tapi tanpa kalkulasi persentase." for Chart B.
    // Let's check payload[0].payload.isDonut or similar.
    const isDonut = payload[0].payload.isDonut;
    const total = payload[0].payload.total;

    return (
      <div style={{
        background: '#1a1a2e',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 12,
        color: 'white'
      }}>
        <p>{payload[0].name}: {payload[0].value}</p>
        {isDonut && total && (
          <p>({((payload[0].value / total) * 100).toFixed(0)}%)</p>
        )}
      </div>
    );
  }
  return null;
};

export default function DashboardOverview({ data, loading, error }) {
  if (loading) {
    return (
      <div className="p-6 bg-[#0a0a0f] min-h-full">
        <h1 className="text-white text-2xl font-bold uppercase mb-6">DASHBOARD OVERVIEW</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[rgba(255,255,255,0.05)] animate-pulse border border-[rgba(255,255,255,0.08)] rounded-xl h-[120px]" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-[rgba(255,255,255,0.05)] animate-pulse border border-[rgba(255,255,255,0.08)] rounded-xl h-[300px]" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-[#0a0a0f] min-h-full">
        <h1 className="text-white text-2xl font-bold uppercase mb-6">DASHBOARD OVERVIEW</h1>
        <div className="flex flex-col items-center justify-center h-[400px] bg-[#0f1117] border border-[rgba(255,255,255,0.08)] rounded-xl">
          <AlertCircle size={32} className="text-[#888780] mb-3" />
          <p className="text-[#888780]">Data tidak tersedia</p>
        </div>
      </div>
    );
  }

  // Safe data extraction
  const productsTotal = data.products?.total || 0;
  const surfboardsTotal = data.products?.totalSurfboards || 0;
  const accessoriesTotal = data.products?.totalAccessories || 0;
  
  const donutData = [
    { name: "Surfboards", value: surfboardsTotal, fill: "#00c2c7", isDonut: true, total: productsTotal },
    { name: "Accessories", value: accessoriesTotal, fill: "#7F77DD", isDonut: true, total: productsTotal }
  ];

  const barData = [
    { name: "Reviews", value: data.storeReviews?.total || 0 },
    { name: "Testimonials", value: data.totalTestimonials || 0 },
    { name: "Galleries", value: data.totalGalleries || 0 },
    { name: "Featured", value: data.totalFeaturedSections || 0 }
  ];

  return (
    <div className="p-6 bg-[#0a0a0f] min-h-full">
      <h1 className="text-white text-2xl font-bold uppercase mb-6">DASHBOARD OVERVIEW</h1>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1 */}
        <div className="bg-[#0f1117] border border-[rgba(255,255,255,0.08)] rounded-xl p-[20px_24px] flex flex-col relative">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase text-[#888780] font-bold tracking-wider">Products</span>
            <Package size={18} className="text-[#888780] opacity-50" />
          </div>
          <div className="text-4xl font-bold text-[#00c2c7] mb-2">{productsTotal}</div>
          <div className="text-[#888780] text-[12px] mt-auto">
            {surfboardsTotal} surfboards · {accessoriesTotal} accessories
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#0f1117] border border-[rgba(255,255,255,0.08)] rounded-xl p-[20px_24px] flex flex-col relative">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase text-[#888780] font-bold tracking-wider">Users</span>
            <Users size={18} className="text-[#888780] opacity-50" />
          </div>
          <div className="text-4xl font-bold text-[#7F77DD] mb-2">{data.totalUsers || 0}</div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#0f1117] border border-[rgba(255,255,255,0.08)] rounded-xl p-[20px_24px] flex flex-col relative">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase text-[#888780] font-bold tracking-wider">Riders</span>
            <User size={18} className="text-[#888780] opacity-50" />
          </div>
          <div className="text-4xl font-bold text-[#D4537E] mb-2">{data.totalRiders || 0}</div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#0f1117] border border-[rgba(255,255,255,0.08)] rounded-xl p-[20px_24px] flex flex-col relative">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase text-[#888780] font-bold tracking-wider">Store Rating</span>
            <Star size={18} className="text-[#888780] opacity-50" />
          </div>
          <div className="text-4xl font-bold text-[#EF9F27] mb-2">
            {data.storeReviews?.avgRating ? `${data.storeReviews.avgRating} ★` : "0 ★"}
          </div>
          <div className="text-[#888780] text-[12px] mt-auto">
            dari {data.storeReviews?.total || 0} ulasan
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CHART A: Donut Chart */}
        <div className="bg-[#0f1117] border border-[rgba(255,255,255,0.08)] rounded-xl p-[20px_24px]">
          <h2 className="text-[11px] text-[#888780] tracking-widest mb-4 uppercase">KOMPOSISI PRODUK</h2>
          <div style={{ height: 220 }} className="w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                {/* Custom Center Labels */}
                <text x="50%" y="47%" textAnchor="middle" fill="white" fontSize={28} fontWeight="bold">
                  {productsTotal}
                </text>
                <text x="50%" y="58%" textAnchor="middle" fill="#888780" fontSize={12}>
                  produk
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Custom Legend */}
          <div className="flex flex-row justify-center gap-4 mt-4">
            {donutData.map((item, idx) => {
              const pct = productsTotal > 0 ? ((item.value / productsTotal) * 100).toFixed(0) : 0;
              return (
                <div key={idx} className="flex items-center gap-2 text-[12px] text-[#888780]">
                  <span className="w-[10px] h-[10px] rounded-sm" style={{ background: item.fill }}></span>
                  <span>{item.name} — {item.value} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHART B: Horizontal Bar Chart */}
        <div className="bg-[#0f1117] border border-[rgba(255,255,255,0.08)] rounded-xl p-[20px_24px]">
          <h2 className="text-[11px] text-[#888780] tracking-widest mb-4 uppercase">DISTRIBUSI KONTEN</h2>
          <div style={{ height: 220 }} className="w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={barData}
                margin={{ top: 5, right: 40, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide={true} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={90}
                  tick={{ fill: '#888780', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="value" fill="#EF9F27" radius={[0, 4, 4, 0]} barSize={18}>
                  <LabelList dataKey="value" position="right" fill="white" fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
