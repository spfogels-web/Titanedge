"use client";
import { useState } from "react";
import { X, ArrowLeft, ArrowRight, CheckCircle2, PlusCircle, Search, Zap } from "lucide-react";
import { propFirms, type PropFirm, type FirmAccountType } from "@/lib/mock/propFirmRegistry";

interface Props {
  onClose: () => void;
  onSaved?: () => void;
}

type Step = 1 | 2 | 3 | 4;

export default function AddPropAccountModal({ onClose, onSaved }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [selectedFirm, setSelectedFirm] = useState<PropFirm | null>(null);
  const [accountSize, setAccountSize] = useState<number | null>(null);
  const [accountType, setAccountType] = useState<FirmAccountType | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [startingBalance, setStartingBalance] = useState("");
  const [filter, setFilter] = useState("");
  const [saved, setSaved] = useState(false);

  const filteredFirms = propFirms.filter((f) =>
    f.name.toLowerCase().includes(filter.toLowerCase()),
  );

  function goNext() {
    if (step === 1 && selectedFirm) setStep(2);
    else if (step === 2 && accountSize && accountType) setStep(3);
    else if (step === 3 && accountNumber && startingBalance) setStep(4);
  }
  function goPrev() {
    if (step > 1) setStep((step - 1) as Step);
  }
  function handleFinish() {
    setSaved(true);
    onSaved?.();
    window.setTimeout(onClose, 1300);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-panel border border-border rounded-xl shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            {step > 1 && !saved && (
              <button
                type="button"
                onClick={goPrev}
                className="text-muted hover:text-white"
                aria-label="Back"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <PlusCircle size={15} className="text-accent" />
            <h2 className="text-sm font-semibold">
              {saved ? "Account Added"
                : step === 1 ? "Add Prop Account · Pick Firm"
                : step === 2 ? `Add ${selectedFirm?.name} · Account Type`
                : step === 3 ? `Add ${selectedFirm?.name} · Account Details`
                :              `Add ${selectedFirm?.name} · Confirm`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step progress dots */}
        {!saved && (
          <div className="px-5 pt-3 flex items-center gap-2 text-[10px] text-muted">
            {[1, 2, 3, 4].map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    s === step ? "bg-accent w-3" : s < step ? "bg-accent" : "bg-border"
                  } transition-all`}
                />
                {s < 4 && <span className={s < step ? "text-accent" : ""}>·</span>}
              </span>
            ))}
            <span className="ml-2">Step {step} of 4</span>
          </div>
        )}

        {/* Body */}
        {saved ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mb-3">
              <CheckCircle2 size={24} className="text-accent" />
            </div>
            <div className="text-sm font-semibold">Account saved</div>
            <div className="text-[11px] text-muted mt-1">
              {selectedFirm?.name} ${accountSize?.toLocaleString()} ({accountType}) added
              to your portfolio.
            </div>
            <div className="text-[10px] text-muted mt-3 italic">
              UI-only save for now — real persistence wires to a prop_accounts table later.
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
              {step === 1 && (
                <Step1
                  firms={filteredFirms}
                  selected={selectedFirm}
                  onSelect={setSelectedFirm}
                  filter={filter}
                  onFilter={setFilter}
                />
              )}
              {step === 2 && selectedFirm && (
                <Step2
                  firm={selectedFirm}
                  size={accountSize}
                  onSize={setAccountSize}
                  type={accountType}
                  onType={setAccountType}
                />
              )}
              {step === 3 && selectedFirm && (
                <Step3
                  firm={selectedFirm}
                  accountNumber={accountNumber}
                  onAccountNumber={setAccountNumber}
                  startingBalance={startingBalance}
                  onStartingBalance={setStartingBalance}
                />
              )}
              {step === 4 && selectedFirm && (
                <Step4
                  firm={selectedFirm}
                  accountSize={accountSize!}
                  accountType={accountType!}
                  accountNumber={accountNumber}
                  startingBalance={startingBalance}
                />
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-border flex items-center justify-between">
              <div className="text-[10px] text-muted">
                {step === 1 && (selectedFirm ? `Selected: ${selectedFirm.name}` : "Pick a firm to continue")}
                {step === 2 && "Choose account size and type"}
                {step === 3 && "Account number + starting balance"}
                {step === 4 && "Review and confirm"}
              </div>
              {step < 4 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={
                    (step === 1 && !selectedFirm) ||
                    (step === 2 && (!accountSize || !accountType)) ||
                    (step === 3 && (!accountNumber || !startingBalance))
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md border border-accent/40 bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight size={12} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md border border-accent/40 bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/20 transition"
                >
                  <CheckCircle2 size={12} />
                  Add Account
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Step1({
  firms, selected, onSelect, filter, onFilter,
}: {
  firms: PropFirm[];
  selected: PropFirm | null;
  onSelect: (f: PropFirm) => void;
  filter: string;
  onFilter: (s: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        Pick your prop firm. We support {firms.length}+ futures-focused firms with varying
        levels of integration.
      </p>
      <div className="relative">
        <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={filter}
          onChange={(e) => onFilter(e.target.value)}
          placeholder="Search firms…"
          className="w-full bg-bg border border-border rounded-md pl-7 pr-3 py-1.5 text-xs focus:outline-none focus:border-accent/40"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto scrollbar-thin">
        {firms.map((f) => {
          const isSel = selected?.id === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelect(f)}
              className={`flex items-center gap-3 p-3 rounded-lg border text-left transition ${
                isSel
                  ? "border-accent/50 bg-accent/5"
                  : "border-border bg-panel2 hover:border-accent/30"
              }`}
            >
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{ backgroundColor: f.accent + "20", color: f.accent }}
              >
                {f.shortName}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{f.name}</div>
                <div className="text-[9px] text-muted truncate">
                  {f.backend} · {f.primaryConnection}
                </div>
              </div>
              {isSel && <CheckCircle2 size={13} className="text-accent shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step2({
  firm, size, onSize, type, onType,
}: {
  firm: PropFirm;
  size: number | null;
  onSize: (s: number) => void;
  type: FirmAccountType | null;
  onType: (t: FirmAccountType) => void;
}) {
  const sizes = firm.accountSizes.length > 0
    ? firm.accountSizes
    : [10000, 25000, 50000, 100000, 150000, 250000];

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[10px] text-muted uppercase tracking-wider mb-2">Account Size</div>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSize(s)}
              className={`p-3 rounded-lg border text-center transition ${
                size === s
                  ? "border-accent/50 bg-accent/10"
                  : "border-border bg-panel2 hover:border-accent/30"
              }`}
            >
              <div className="font-mono font-bold text-sm">
                ${(s / 1000).toFixed(0)}K
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[10px] text-muted uppercase tracking-wider mb-2">Account Type</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {firm.accountTypes.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onType(t)}
              className={`p-3 rounded-lg border text-center transition ${
                type === t
                  ? "border-accent/50 bg-accent/10"
                  : "border-border bg-panel2 hover:border-accent/30"
              }`}
            >
              <div className="text-xs font-semibold">{t}</div>
              <div className="text-[10px] text-muted mt-1">
                {t === "XFA" || t === "FUNDED" || t === "LIVE" ? "Live capital" :
                 t === "PRO" ? "Pro account" :
                              "Evaluation phase"}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step3({
  firm, accountNumber, onAccountNumber, startingBalance, onStartingBalance,
}: {
  firm: PropFirm;
  accountNumber: string;
  onAccountNumber: (s: string) => void;
  startingBalance: string;
  onStartingBalance: (s: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-[10px] text-muted uppercase tracking-wider mb-1">
            Account number / ID
          </span>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => onAccountNumber(e.target.value)}
            placeholder={`${firm.shortName}-50K-XXXXX`}
            className="w-full bg-bg border border-border rounded-md px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent/40"
          />
        </label>
        <label className="block">
          <span className="block text-[10px] text-muted uppercase tracking-wider mb-1">
            Current balance (USD)
          </span>
          <input
            type="number"
            value={startingBalance}
            onChange={(e) => onStartingBalance(e.target.value)}
            placeholder="50000"
            className="w-full bg-bg border border-border rounded-md px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent/40"
          />
        </label>
      </div>

      {firm.autoSync && (
        <div className="p-4 rounded-lg border border-accent/30 bg-accent/5">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={12} className="text-accent" />
            <span className="text-xs font-semibold text-accent">
              Auto-Sync available for {firm.name}
            </span>
          </div>
          <p className="text-[11px] text-muted leading-relaxed">
            {firm.name} supports {firm.primaryConnection}. After you add the account here, you'll
            be prompted to connect API credentials so balance and positions update automatically.
            Order routing also works via this connection.
          </p>
        </div>
      )}

      {!firm.autoSync && (
        <div className="p-4 rounded-lg border border-border bg-panel2/50">
          <div className="text-xs font-semibold mb-2">Tracking method: {firm.primaryConnection}</div>
          <p className="text-[11px] text-muted leading-relaxed">
            {firm.notes} You can update the balance manually anytime from the prop accounts table,
            or fire the bot's webhook with the right account tag and we'll attribute trades to this
            account automatically.
          </p>
        </div>
      )}
    </div>
  );
}

function Step4({
  firm, accountSize, accountType, accountNumber, startingBalance,
}: {
  firm: PropFirm;
  accountSize: number;
  accountType: FirmAccountType;
  accountNumber: string;
  startingBalance: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">Review the details before adding to your portfolio.</p>
      <div className="p-4 rounded-lg border border-border bg-panel2">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-md flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: firm.accent + "20", color: firm.accent }}
          >
            {firm.shortName}
          </div>
          <div>
            <div className="text-sm font-bold">{firm.name}</div>
            <div className="text-[10px] text-muted">{firm.backend} backend</div>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <dt className="text-[10px] text-muted uppercase tracking-wider">Size</dt>
            <dd className="font-mono font-semibold mt-0.5">${accountSize.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted uppercase tracking-wider">Type</dt>
            <dd className="font-semibold mt-0.5">{accountType}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted uppercase tracking-wider">Account #</dt>
            <dd className="font-mono mt-0.5">{accountNumber}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted uppercase tracking-wider">Balance</dt>
            <dd className="font-mono font-semibold mt-0.5">
              ${Number(startingBalance).toLocaleString()}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-[10px] text-muted uppercase tracking-wider">Connection</dt>
            <dd className="mt-0.5">{firm.primaryConnection}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
