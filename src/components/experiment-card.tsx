import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import type { Experiment } from "@/lib/experiments";
import { domainColors, domainLabels } from "@/lib/experiments";

export function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const isNovel = experiment.paperReference.includes("Novel");

  return (
    <Link href={`/experiment/${experiment.id}`}>
      <Card className="group h-full flex flex-col transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="ghost"
              className={domainColors[experiment.domain]}
            >
              {domainLabels[experiment.domain]}
            </Badge>
            {isNovel && (
              <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
                Novel Finding
              </Badge>
            )}
          </div>
          <CardTitle className="font-serif text-xl group-hover:text-slate-600 transition-colors">
            {experiment.title}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {experiment.description}
          </CardDescription>
          <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 leading-relaxed">
            <span className="font-medium text-slate-700">Paper finding: </span>
            {experiment.finding}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col flex-1">
          <div className="mt-auto pt-2 flex items-center text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
            Run this experiment
            <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
