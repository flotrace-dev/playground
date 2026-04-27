// Bug 8 — Redux burst actions + non-memoized selector.
// `useSelector(state => state.cart.items.map(...))` returns a fresh array on
// every dispatch. Combined with rapid-fire add/remove actions (the "burst"
// button fires 8 dispatches in 80ms) this re-renders every consumer,
// regardless of whether their actual data changed.
// In FloTrace: Redux panel highlights changed slices, action timeline shows
// the burst, render reason on consumers reads "selector returned new reference".

import { useDispatch, useSelector } from "react-redux";
import {
  cartActions,
  sessionActions,
  type AppDispatch,
  type RootState,
} from "../store/reduxStore";

const PRODUCTS = [
  { id: 1, name: "Mechanical keyboard", price: 129 },
  { id: 2, name: "Coffee grinder", price: 199 },
  { id: 3, name: "Standing desk mat", price: 49 },
  { id: 4, name: "USB-C dock", price: 89 },
];

export function Bug8ReduxBurst() {
  const dispatch = useDispatch<AppDispatch>();

  const burst = () => {
    // 8 dispatches in tight succession — FloTrace's Redux action timeline
    // groups them and highlights the cart slice repeatedly.
    PRODUCTS.forEach((p, i) => {
      setTimeout(() => dispatch(cartActions.add(p)), i * 10);
    });
    PRODUCTS.slice(0, 3).forEach((p, i) =>
      setTimeout(() => dispatch(cartActions.remove(p.id)), 80 + i * 10)
    );
  };

  return (
    <section className="bug">
      <span className="label">Bug 8 · Redux burst + bad selector</span>
      <h2>Rapid dispatches and a selector that always returns a new array</h2>
      <p className="description">
        Click <em>Burst</em> to fire 8 dispatches in 80ms. <code>CartLine</code>{" "}
        re-renders every time because <code>state.cart.items.map(...)</code>{" "}
        returns a fresh array on every <code>useSelector</code> call.
      </p>
      <div className="demo">
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <button className="btn" onClick={burst}>
            Burst 8 dispatches
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => dispatch(cartActions.clear())}
          >
            Clear cart
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => dispatch(sessionActions.login(42))}
          >
            session.login(42)
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => dispatch(sessionActions.touch())}
          >
            session.touch
          </button>
        </div>
        <CartLine />
        <CartTotal />
        <SessionLine />
      </div>
    </section>
  );
}

function CartLine() {
  // BUG: .map produces a new array reference every render — RTK warns about this.
  const labels = useSelector((s: RootState) =>
    s.cart.items.map((i) => `${i.name} ×${i.qty}`)
  );
  return (
    <div className="kv">
      Items: {labels.length === 0 ? "(empty)" : labels.join(" · ")}
    </div>
  );
}

function CartTotal() {
  const total = useSelector((s: RootState) => s.cart.totalCents);
  return (
    <div className="kv">
      Total: ${(total / 100).toFixed(2)}
    </div>
  );
}

function SessionLine() {
  const userId = useSelector((s: RootState) => s.session.userId);
  const action = useSelector((s: RootState) => s.session.lastAction);
  return (
    <div className="kv">
      Session: userId={userId ?? "—"} · last={action}
    </div>
  );
}
