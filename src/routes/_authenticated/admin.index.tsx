import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Store,
  UtensilsCrossed,
  ScanLine,
  Activity,
  ArrowUpRight,
  QrCode,
  Palette,
  Video,
  LayoutTemplate,
  Plus,
  TrendingUp,
  Sparkles,
  Users,
  IndianRupee,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: DashboardHome,
});

function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const since = new Date(
        Date.now() - 24 * 60 * 60 * 1000
      ).toISOString();

      const [
        restaurants,
        active,
        items,
        scansToday,
        recent,
      ] = await Promise.all([
        supabase
          .from("restaurants")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("restaurants")
          .select("*", { count: "exact", head: true })
          .eq("status", "active"),

        supabase
          .from("menu_items")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("qr_scans")
          .select("*", { count: "exact", head: true })
          .gte("scanned_at", since),

        supabase
          .from("restaurants")
          .select("id,name,slug,status,created_at")
          .order("created_at", {
            ascending:false,
          })
          .limit(6),
      ]);

      return {
        totalRestaurants: restaurants.count ?? 0,
        activeRestaurants: active.count ?? 0,
        totalItems: items.count ?? 0,
        scansToday: scansToday.count ?? 0,
        recent: recent.data ?? [],
      };
    },
    staleTime:15000,
  });
}


const quickActions = [
 {
  label:"Create Restaurant",
  description:"Launch a new digital menu",
  to:"/admin/restaurants/new",
  icon:Plus,
 },
 {
  label:"Restaurant Hub",
  description:"Manage all businesses",
  to:"/admin/restaurants",
  icon:Store,
 },
 {
  label:"Menu Builder",
  description:"Edit food catalogue",
  to:"/my-menu",
  icon:UtensilsCrossed,
 },
 {
  label:"QR Manager",
  description:"Generate smart QR",
  to:"/admin/qr",
  icon:QrCode,
 },
 {
  label:"Design Studio",
  description:"Luxury menu themes",
  to:"/admin/design-studio",
  icon:Palette,
 },
 {
  label:"Video Manager",
  description:"Manage promo videos",
  to:"/admin/videos",
  icon:Video,
 },
 {
  label:"Templates",
  description:"Premium designs",
  to:"/admin/menu-designs",
  icon:LayoutTemplate,
 },
] as const;


function DashboardHome(){

const {data,isLoading}=useDashboard();


const stats=[
{
 label:"Restaurants",
 value:data?.totalRestaurants ?? 0,
 icon:Store
},
{
 label:"Active Now",
 value:data?.activeRestaurants ?? 0,
 icon:Activity
},
{
 label:"Menu Items",
 value:data?.totalItems ?? 0,
 icon:UtensilsCrossed
},
{
 label:"QR Scans",
 value:data?.scansToday ?? 0,
 icon:ScanLine
},
];


return (
<div className="space-y-8">


<section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-black p-8">

<div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"/>

<div className="relative flex flex-col gap-6 md:flex-row md:justify-between md:items-end">

<div>

<div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-4 py-1 text-xs text-neutral-300">
<Sparkles className="h-3 w-3"/>
BAT MENU SUPER ADMIN
</div>


<h1 className="mt-5 text-4xl font-semibold tracking-tight text-white">
Your Restaurant
<br/>
Command Center
</h1>


<p className="mt-3 max-w-xl text-sm text-neutral-400">
Manage restaurants, menus, QR experiences and digital food brands from one powerful dashboard.
</p>

</div>


<Link
to="/admin/restaurants/new"
className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black hover:bg-neutral-200 transition"
>
Create Restaurant
<ArrowUpRight className="h-4 w-4"/>
</Link>


</div>


<div className="relative mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">

{stats.map((item)=>(
<div
key={item.label}
className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
>

<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
<item.icon className="h-5 w-5"/>
</div>

<p className="mt-4 text-2xl font-semibold text-white">
{isLoading ? "—" : item.value.toLocaleString()}
</p>

<p className="text-xs uppercase tracking-widest text-neutral-500">
{item.label}
</p>


</div>
))}

</div>

</section>{/* QUICK ACTIONS */}

<section>
<div className="mb-5 flex items-center justify-between">
<h2 className="text-xl font-semibold text-white">
Quick Actions
</h2>

<span className="text-xs text-neutral-500">
Admin Tools
</span>
</div>


<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

{quickActions.map((action)=>(
<Link
key={action.to}
to={action.to}
className="
group relative overflow-hidden rounded-2xl
border border-neutral-800
bg-neutral-950
p-5
transition
hover:-translate-y-1
hover:border-neutral-600
"
>

<div className="
flex h-12 w-12 items-center justify-center
rounded-xl bg-white text-black
transition group-hover:scale-110
">
<action.icon className="h-5 w-5"/>
</div>


<h3 className="mt-5 font-medium text-white">
{action.label}
</h3>

<p className="mt-1 text-xs text-neutral-500">
{action.description}
</p>


<ArrowUpRight
className="
absolute right-4 top-4
h-4 w-4 text-neutral-600
group-hover:text-white
"
/>

</Link>
))}

</div>
</section>



{/* ANALYTICS */}

<section className="grid gap-5 lg:grid-cols-3">


<div className="rounded-3xl border border-neutral-800 bg-black p-6">

<div className="flex items-center gap-3">
<div className="rounded-xl bg-white p-3 text-black">
<IndianRupee className="h-5 w-5"/>
</div>

<div>
<p className="text-sm text-neutral-400">
Monthly Revenue
</p>

<h3 className="text-2xl font-semibold text-white">
₹0
</h3>
</div>

</div>


<div className="mt-6 flex items-center gap-2 text-xs text-neutral-500">
<TrendingUp className="h-4 w-4"/>
Revenue analytics coming soon
</div>

</div>



<div className="rounded-3xl border border-neutral-800 bg-black p-6">

<div className="flex items-center gap-3">

<div className="rounded-xl bg-white p-3 text-black">
<Users className="h-5 w-5"/>
</div>


<div>
<p className="text-sm text-neutral-400">
Customers
</p>

<h3 className="text-2xl font-semibold text-white">
0
</h3>
</div>

</div>


<p className="mt-6 text-xs text-neutral-500">
Live customer tracking
</p>

</div>



<div className="rounded-3xl border border-neutral-800 bg-black p-6">

<div className="flex items-center gap-3">

<div className="rounded-xl bg-white p-3 text-black">
<ScanLine className="h-5 w-5"/>
</div>


<div>
<p className="text-sm text-neutral-400">
QR Activity
</p>

<h3 className="text-2xl font-semibold text-white">
{data?.scansToday ?? 0}
</h3>
</div>

</div>


<p className="mt-6 text-xs text-neutral-500">
Last 24 hours scans
</p>

</div>


</section>




{/* RECENT RESTAURANTS */}

<section className="
rounded-3xl border border-neutral-800
bg-black p-6
">


<div className="flex justify-between items-center">

<h2 className="text-xl font-semibold text-white">
Recent Restaurants
</h2>


<Link
to="/admin/restaurants"
className="text-xs text-neutral-500 hover:text-white"
>
View All →
</Link>

</div>



{!isLoading &&
(data?.recent ?? []).length===0 && (

<div className="py-16 text-center">

<Store className="mx-auto h-10 w-10 text-neutral-700"/>

<p className="mt-4 text-white">
No restaurants yet
</p>

<p className="mt-2 text-sm text-neutral-500">
Create your first restaurant
</p>

</div>

)}



<ul className="mt-5 divide-y divide-neutral-800">

{(data?.recent ?? []).map((r)=>(

<li
key={r.id}
className="
flex items-center gap-4 py-4
"
>


<div className="
flex h-12 w-12 items-center justify-center
rounded-xl bg-neutral-900 text-white
">

<Store className="h-5 w-5"/>

</div>



<div className="flex-1">

<p className="text-sm font-medium text-white">
{r.name}
</p>

<p className="text-xs text-neutral-500">
/m/{r.slug}
</p>

</div>



<span className="
rounded-full border border-neutral-700
px-3 py-1 text-[10px]
uppercase text-neutral-400
">

{r.status}

</span>


<Link
to="/admin/restaurants/$id"
params={{id:r.id}}
className="text-xs text-neutral-400 hover:text-white"
>
Open →
</Link>


</li>

))}

</ul>


</section>


</div>
);

}
