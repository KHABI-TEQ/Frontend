"use client";
import React, { useEffect, useRef, useState } from "react";
import { useUserContext } from "@/context/user-context";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { decrementFeature } from "@/store/subscriptionFeaturesSlice";
import toast from "react-hot-toast";
import { BarChart2 } from "lucide-react";

const STORAGE_KEY = "subscriptionFABPosition";

const SubscriptionFeaturesFAB: React.FC = () => {
  const { user } = useUserContext();
  const dispatch = useAppDispatch();
  const sub = useAppSelector((s) => s.subscription.active);
  const catalog = useAppSelector((s) => s.subscription.catalog.byKey);

  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<{ right: number; bottom: number }>({ right: 24, bottom: 80 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement | null>(null);
  const pointerData = useRef<{ startX: number; startY: number; startRight: number; startBottom: number } | null>(null);

  // Load persisted position
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.right === "number" && typeof parsed?.bottom === "number") {
          setPosition({ right: parsed.right, bottom: parsed.bottom });
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!dragging) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    }
  }, [dragging, position]);

  // Only show for logged in Agent with active subscription
  const shouldRender = !!user && (user as any).userType === "Agent" && !!sub && sub.status === "active";
  if (!shouldRender) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    setDragging(true);
    pointerData.current = {
      startX: e.clientX,
      startY: e.clientY,
      startRight: position.right,
      startBottom: position.bottom,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !pointerData.current) return;
    const dx = e.clientX - pointerData.current.startX;
    const dy = e.clientY - pointerData.current.startY;
    // update right and bottom inversely
    const newRight = Math.max(8, Math.min(window.innerWidth - 56, pointerData.current.startRight - dx));
    const newBottom = Math.max(8, Math.min(window.innerHeight - 56, pointerData.current.startBottom - dy));
    setPosition({ right: newRight, bottom: newBottom });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    pointerData.current = null;
  };

  const handleUseFeature = (key: string) => {
    // decrement and show toast
    dispatch(decrementFeature({ key, amount: 1 }));
    toast.success("Feature usage recorded");
  };

  const features = sub?.featuresByKey ? Object.entries(sub.featuresByKey) : [];

  return (
    <div
      ref={dragRef}
      style={{ position: "fixed", right: position.right, bottom: position.bottom, zIndex: 60 }}
      className="select-none"
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="button"
        tabIndex={0}
        onClick={() => setVisible((v) => !v)}
        className={`w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center shadow-xl cursor-pointer transition-transform active:scale-95`}
        title="Subscription Features"
      >
        <BarChart2 size={20} />
      </div>

      {visible && (
        <div className="mt-3 w-80 max-h-[60vh] overflow-auto bg-white rounded-lg shadow-lg border border-gray-100 p-3">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-sm text-gray-700 font-semibold">Subscription Features</div>
              <div className="text-xs text-gray-500">Plan: {sub?.meta?.appliedPlanName || sub?.meta?.planType || 'N/A'}</div>
            </div>
            <button onClick={() => setVisible(false)} className="text-xs text-gray-500">Close</button>
          </div>

          <div className="space-y-2">
            {features.length === 0 && <div className="text-sm text-gray-500">No features available</div>}
            {features.map(([key, entry]: any) => {
              const label = (catalog && typeof catalog[key]?.label === 'string' ? catalog[key].label : (typeof key === 'string' ? key : String(key)));
              const type = entry.type;
              const value = entry.value;
              const remaining = entry.remaining;

              return (
                <div key={key} className="flex items-center justify-between gap-2 p-2 rounded hover:bg-gray-50">
                  <div>
                    <div className="text-sm font-medium text-gray-700">{label}</div>
                    <div className="text-xs text-gray-500">
                      {type === 'boolean' && (Number(value) === 1 ? 'Enabled' : 'Disabled')}
                      {type === 'unlimited' && 'Unlimited'}
                      {type === 'count' && `Remaining: ${remaining}`}
                    </div>
                  </div>
                  <div>
                    {type === 'count' && Number(remaining) !== -1 ? (
                      <button
                        onClick={() => handleUseFeature(key)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-xs"
                        disabled={Number(remaining) <= 0}
                      >
                        Use
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
};

export default SubscriptionFeaturesFAB;
