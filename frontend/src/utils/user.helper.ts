// "Ada Lovelace" -> "AL", "ada" -> "A"
export const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export const getFirstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;
