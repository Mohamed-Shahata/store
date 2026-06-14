import {
  getDashboardStats,
  getRecentProducts,
} from "@/lib/data/products";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, FolderOpen, ShoppingCart, Percent } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

interface AdminDashboardPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function AdminDashboardPage({
  params,
}: AdminDashboardPageProps) {
  const { locale } = await params;
  const [stats, recentProducts, t] = await Promise.all([
    getDashboardStats(),
    getRecentProducts(),
    getTranslations({ locale, namespace: "admin" }),
  ]);

  const statCards = [
    {
      title: t("stats.totalProducts"),
      value: stats.totalProducts,
      icon: Package,
      href: "/admin/products",
    },
    {
      title: t("stats.totalCategories"),
      value: stats.totalCategories,
      icon: FolderOpen,
      href: "/admin/categories",
    },
    {
      title: t("stats.ordersSent"),
      value: stats.totalOrders,
      icon: ShoppingCart,
      href: "/admin",
    },
    {
      title: t("stats.activeDiscounts"),
      value: stats.activeDiscounts,
      icon: Percent,
      href: "/admin/discounts",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t("dashboard")}</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("recentProducts")}</CardTitle>
        </CardHeader>
        <CardContent>
          {recentProducts.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t("empty.noProductsShort")}
            </p>
          ) : (
            <div className="space-y-3">
              {recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="font-medium hover:underline"
                    >
                      {product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {product.category?.name ?? t("uncategorized")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(product.price)}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("stock")}: {product.stock_quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
