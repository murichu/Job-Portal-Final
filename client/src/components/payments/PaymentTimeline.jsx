const steps = [
  { key: "started", label: "Payment started" },
  { key: "prompt", label: "Prompt sent" },
  { key: "waiting", label: "Waiting confirmation" },
  { key: "complete", label: "Completed" },
];

export default function PaymentTimeline({ currentStep = 0, status = "pending" }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h3 className="text-lg font-semibold text-slate-900">Payment timeline</h3>
      <div className="mt-5 space-y-4">
        {steps.map((step, index) => {
          const active = index <= currentStep;
          const failed = status === "failed" && index === currentStep;
          return (
            <div key={step.key} className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${failed ? "bg-red-100 text-red-700" : active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                {failed ? "!" : active ? "✓" : index + 1}
              </div>
              <div>
                <p className="font-medium text-slate-900">{step.label}</p>
                <p className="text-sm text-slate-500">{active ? "Done" : "Pending"}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
