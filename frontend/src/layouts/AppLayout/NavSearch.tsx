import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { Icon } from "../../components/ui/Icon";
import { useAuth } from "../../hooks/useAuth";
import { getSearchableItems } from "./nav.config";
import styles from "./NavSearch.module.css";

interface NavSearchProps {
  className?: string;
  // register the global "/" shortcut (only one instance should)
  shortcut?: boolean;
  onNavigate?: () => void;
}

// Quick-jump search over the pages this user can open
export function NavSearch({ className, shortcut = false, onNavigate }: NavSearchProps) {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const items = useMemo(() => getSearchableItems(hasRole), [hasRole]);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      `${item.label} ${item.description ?? ""} ${item.keywords ?? ""}`.toLowerCase().includes(q)
    );
  }, [items, query]);

  useEffect(() => {
    if (!shortcut) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [shortcut]);

  const go = (to: string) => {
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
    navigate(to);
    onNavigate?.();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (event.key === "Enter") {
      const target = results[active];
      if (open && target) {
        event.preventDefault();
        go(target.to);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const activeId = open && results[active] ? `${listId}-${active}` : undefined;

  return (
    <div className={`${styles.search} ${className ?? ""}`}>
      <span className={styles.icon}>
        <Icon name="search" size={16} />
      </span>
      <input
        ref={inputRef}
        type="search"
        className={styles.input}
        placeholder="Search"
        aria-label="Search pages"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={activeId}
        autoComplete="off"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {shortcut && !query && (
        <kbd className={styles.kbd} aria-hidden="true">
          /
        </kbd>
      )}

      {open && (
        <div className={styles.popup}>
          <p className={styles.popupHeading}>{query.trim() ? "Results" : "Jump to"}</p>
          <ul id={listId} role="listbox" aria-label="Pages" className={styles.list}>
            {results.map((item, index) => (
              <li
                key={item.to}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                className={styles.option}
                // keep focus in the input so blur doesn't close before click
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => go(item.to)}
              >
                <span className={styles.optionIcon}>
                  <Icon name={item.icon} size={16} />
                </span>
                <span className={styles.optionText}>
                  <span className={styles.optionLabel}>{item.label}</span>
                  {item.description && (
                    <span className={styles.optionDescription}>{item.description}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          {results.length === 0 && (
            <p className={styles.empty}>No pages match &ldquo;{query.trim()}&rdquo;</p>
          )}
        </div>
      )}
    </div>
  );
}
