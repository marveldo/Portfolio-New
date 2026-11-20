export type DemoEvent = {
  id: number;
  title: string;
  category: string;
  date: string;
  city: string;
  price: number;
  hue: string;
  description: string;
};

export type DemoBook = {
  id: number;
  title: string;
  author: string;
  price: number;
  cover: string;
  ink: string;
};

export const demoEvents: DemoEvent[] = [
  { id: 1, title: "Lagos Tech Summit", category: "Tech", date: "Sat, 6 Dec", city: "Victoria Island", price: 5000, hue: "#ff6a2b", description: "A day of talks on payments, infra and shipping fast in Africa." },
  { id: 2, title: "Afrobeats Rooftop", category: "Music", date: "Fri, 12 Dec", city: "Lekki", price: 12000, hue: "#7c5cff", description: "Sunset sets, three DJs and a skyline view." },
  { id: 3, title: "Open Source Saturday", category: "Tech", date: "Sat, 13 Dec", city: "Yaba", price: 0, hue: "#2bd4a4", description: "Bring a laptop, pick an issue, ship a PR before dinner." },
  { id: 4, title: "Jollof Wars", category: "Food", date: "Sun, 14 Dec", city: "Ikeja", price: 3500, hue: "#ffb020", description: "Twelve kitchens. One winner. Unlimited tasting." },
  { id: 5, title: "Canvas & Wine", category: "Art", date: "Thu, 18 Dec", city: "Ikoyi", price: 8000, hue: "#ff4f8b", description: "Guided painting night, all materials included." },
  { id: 6, title: "Founders Breakfast", category: "Tech", date: "Tue, 9 Dec", city: "Victoria Island", price: 0, hue: "#3ba3ff", description: "Small-table breakfast with early-stage founders." },
];

export const demoCategories = ["All", "Tech", "Music", "Food", "Art"];

export const demoBooks: DemoBook[] = [
  { id: 1, title: "The Quiet Compiler", author: "A. Okafor", price: 6500, cover: "#1e3a5f", ink: "#f2c14e" },
  { id: 2, title: "Rivers of Lagos", author: "T. Bello", price: 4800, cover: "#7a2e1f", ink: "#f4e3c1" },
  { id: 3, title: "Small Machines", author: "K. Mensah", price: 5200, cover: "#204e3a", ink: "#b9f5da" },
  { id: 4, title: "Night Market", author: "F. Adeyemi", price: 3900, cover: "#2a1f4d", ink: "#ff8fb1" },
  { id: 5, title: "Paper Engines", author: "J. Nwosu", price: 7100, cover: "#3d3d3d", ink: "#ff6a2b" },
  { id: 6, title: "Harmattan", author: "L. Danjuma", price: 4400, cover: "#c98a2e", ink: "#2a1d0c" },
];

export const naira = (n: number) => (n === 0 ? "Free" : "₦" + n.toLocaleString("en-NG"));
