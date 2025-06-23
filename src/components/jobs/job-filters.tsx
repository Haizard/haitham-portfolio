
"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Filter as FilterIcon, Search, RotateCcw } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

const filterSchema = z.object({
  search: z.string().optional(),
  minBudget: z.coerce.number().optional(),
  maxBudget: z.coerce.number().optional(),
  budgetType: z.enum(['fixed', 'hourly']).optional(),
  skills: z.string().optional(),
});

export type JobFilterValues = z.infer<typeof filterSchema>;

interface JobFiltersProps {
  onFilterChange: (filters: JobFilterValues) => void;
}

export function JobFilters({ onFilterChange }: JobFiltersProps) {
  const form = useForm<JobFilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: "",
      minBudget: undefined,
      maxBudget: undefined,
      skills: "",
    },
  });

  const debouncedOnFilterChange = useDebouncedCallback(onFilterChange, 500);

  const onSubmit: SubmitHandler<JobFilterValues> = (data) => {
    onFilterChange(data);
  };
  
  const handleReset = () => {
    form.reset({
      search: "",
      minBudget: undefined,
      maxBudget: undefined,
      budgetType: undefined,
      skills: "",
    });
    onFilterChange({}); // Reset to no filters
  };

  // Auto-submit on change for any field
  const watchedFields = form.watch();
  React.useEffect(() => {
    debouncedOnFilterChange(watchedFields);
  }, [watchedFields, debouncedOnFilterChange]);


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FilterIcon className="h-5 w-5 text-primary" />
          Filter Jobs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keyword Search</FormLabel>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Job title, description..." className="pl-8" {...field} />
                  </div>
                </FormItem>
              )}
            />
            
            <div>
              <Label>Budget ($)</Label>
              <div className="flex gap-2 mt-1">
                <FormField
                  control={form.control}
                  name="minBudget"
                  render={({ field }) => (
                    <FormItem className="flex-1"><FormControl><Input type="number" placeholder="Min" {...field} /></FormControl></FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxBudget"
                  render={({ field }) => (
                    <FormItem className="flex-1"><FormControl><Input type="number" placeholder="Max" {...field} /></FormControl></FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="budgetType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Type</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4 pt-1">
                      <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="fixed" /></FormControl><FormLabel className="font-normal">Fixed</FormLabel></FormItem>
                      <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="hourly" /></FormControl><FormLabel className="font-normal">Hourly</FormLabel></FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

             <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills (comma-separated)</FormLabel>
                   <Input placeholder="Figma, React, UI/UX" {...field} />
                   <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                 <Button type="button" variant="outline" onClick={handleReset} className="w-full flex-1">
                    <RotateCcw className="mr-2 h-4 w-4"/>
                    Reset
                </Button>
                <Button type="submit" className="w-full flex-1 bg-primary hover:bg-primary/90">
                    <Search className="mr-2 h-4 w-4"/>
                    Apply Filters
                </Button>
            </div>

          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
