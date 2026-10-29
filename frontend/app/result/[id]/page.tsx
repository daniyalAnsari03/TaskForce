import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Container from "@/components/ui/Container";

async function ResultId({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <p className="text-[13px] text-muted">Result id: {id}</p>;
}

export default function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="px-3 py-2">
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      <Container>
        <h1 className="text-[18px] font-medium">Result</h1>
        <Suspense fallback={null}>
          <ResultId params={params} />
        </Suspense>
        <p className="text-[13px] text-muted">Coming soon.</p>
      </Container>
    </div>
  );
}
