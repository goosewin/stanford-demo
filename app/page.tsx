import { VapiExample } from '@/app/components/VapiExample';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-14">
        <header className="space-y-6">
          <Badge
            variant="outline"
            className="w-fit border-border/60 px-3 py-1 text-xs uppercase tracking-[0.32em]"
          >
            Stanford Voice AI Workshop
          </Badge>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Hands-on Voice AI console for the workshop
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Clone the repo, connect your Vapi keys, and use the console below to run
            real-time calls powered by the <span className="font-mono">useVapi</span> hook
            and shadcn/ui components.
          </p>
        </header>

        <VapiExample />

        <Card className="border border-border/60 bg-background/80">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Workshop Checklist</CardTitle>
            <CardDescription>
              Follow these steps after cloning the repo to get your local environment
              ready.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2">
            <ol className="list-decimal space-y-3 pl-5 text-sm text-muted-foreground">
              <li>
                Populate <span className="font-mono">NEXT_PUBLIC_VAPI_PUBLIC_KEY</span>{' '}
                and <span className="font-mono">NEXT_PUBLIC_VAPI_ASSISTANT_ID</span> in{' '}
                <span className="font-mono">.env.local</span> with the credentials from
                your Vapi dashboard. If you do not have an assistant yet, create one in
                Vapi Studio first.
              </li>
              <li>
                Run <span className="font-mono">bun dev</span> and visit{' '}
                <span className="font-mono">http://localhost:3000</span> to open the call
                console.
              </li>
              <li>
                Start a call, speak naturally, and watch the transcript stream in while
                you test latency and interruption handling.
              </li>
              <li>
                Import the reusable{' '}
                <span className="font-mono">&lt;VapiButton /&gt;</span> component into
                your own pages to extend the demo.
              </li>
            </ol>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h3 className="mb-2 font-semibold text-foreground">Core files</h3>
                <ul className="space-y-1 font-mono">
                  <li>app/hooks/useVapi.tsx</li>
                  <li>app/components/VapiExample.tsx</li>
                  <li>app/components/VapiButton.tsx</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-foreground">UI stack</h3>
                <p>
                  Built with the latest shadcn/ui registry, Tailwind 4 tokens, and the
                  Geist type family for a focused, minimal interface.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
