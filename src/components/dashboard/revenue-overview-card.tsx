
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart";
import { useState, useEffect } from "react";

const initialChartData = [
  { month: "Jan", revenue: 0 },
  { month: "Feb", revenue: 0 },
  { month: "Mar", revenue: 0 },
  { month: "Apr", revenue: 0 },
  { month: "May", revenue: 0 },
  { month: "Jun", revenue: 0 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
};

export function RevenueOverviewCard() {
  const [chartData, setChartData] = useState(initialChartData);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [percentageChange, setPercentageChange] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generatedData = [
      { month: "Jan", revenue: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Feb", revenue: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Mar", revenue: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Apr", revenue: Math.floor(Math.random() * 5000) + 1000 },
      { month: "May", revenue: Math.floor(Math.random() * 5000) + 1000 },
      { month: "Jun", revenue: Math.floor(Math.random() * 5000) + 1000 },
    ];
    setChartData(generatedData);

    const calculatedTotalRevenue = generatedData.reduce((sum, item) => sum + item.revenue, 0);
    setTotalRevenue(calculatedTotalRevenue);

    const lastMonthRevenue = generatedData[generatedData.length -1]?.revenue || 0;
    const secondLastMonthRevenue = generatedData[generatedData.length -2]?.revenue || 0;
    const calculatedPercentageChange = secondLastMonthRevenue > 0 ? ((lastMonthRevenue - secondLastMonthRevenue) / secondLastMonthRevenue) * 100 : 0;
    setPercentageChange(calculatedPercentageChange);
    setIsLoading(false);
  }, []);

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" />
          Revenue Overview
        </CardTitle>
        <CardDescription>Your financial performance over the past months.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-muted-foreground">Total Revenue (6 mo)</p>
                    <p className="text-2xl font-bold">${totalRevenue !== null ? totalRevenue.toLocaleString() : '...'}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Last Month Change</p>
                    {percentageChange !== null ? (
                        <p className={`text-2xl font-bold flex items-center ${percentageChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {percentageChange >= 0 ? <TrendingUp className="h-5 w-5 mr-1"/> : <TrendingDown className="h-5 w-5 mr-1"/>}
                            {percentageChange.toFixed(1)}%
                        </p>
                    ) : <p className="text-2xl font-bold">...</p>}
                </div>
            </div>
            <div className="h-[250px] w-full">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
                     <RechartsTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
