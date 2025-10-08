import { api } from "@ki-admin-web/backend/convex/_generated/api"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table"
import { zodValidator } from "@tanstack/zod-adapter"
import { usePaginatedQuery, useQuery } from "convex/react"
import { addDays, isBefore, isFuture } from "date-fns"
import { useMemo, useState } from "react"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { cn, routeSearchSchema } from "@/lib/utils"

export const Route = createFileRoute("/_default/_layout/sentra-ki-dashboard")({
	component: RouteComponent,
	validateSearch: zodValidator(routeSearchSchema),
})

const emptyArray: any[] = []

function RouteComponent() {
	const search = Route.useSearch()
	const navigate = useNavigate({ from: Route.fullPath })

	const itemsToLoad = search.page * search.limit

	const { results, status, loadMore } = usePaginatedQuery(
		api.pks.getAllPksPaginated,
		{
			searchTerm: search.query,
		},
		{ initialNumItems: itemsToLoad },
	)

	const pksData = useQuery(api.pks.getAllPks, {
		searchTerm: search.query,
	})

	const columns: ColumnDef<(typeof results)[number]>[] = [
		{
			id: "#",
			header: "No",
			cell: ({ row }) => (search.page - 1) * search.limit + row.index + 1,
		},
		{
			accessorKey: "sentra_ki_id",
			id: "Nama Sentra KI",
			header: "Nama Sentra KI",
			cell: ({ row }) => {
				const data = row.original
				return data.sentra_ki?.name ?? "-"
			},
		},
		{
			id: "Tanggal Kadaluarsa",
			header: "Tanggal Kadaluarsa",
			cell: ({ row }) => {
				const data = row.original
				return data.expiry_date_to ?? "-"
			},
		},
		{
			id: "Status",
			header: "Status",
			cell: ({ row }) => {
				const item = row.original
				let status: "Aktif" | "Kedaluwarsa" | "Akan Habis" | "-" = "-"

				const date = new Date(item.expiry_date_to)
				const activeDate = isFuture(date)
				const almostExpiredDate = isBefore(date, addDays(new Date(), 30))

				if (almostExpiredDate) {
					status = "Akan Habis"
				} else {
					if (activeDate) {
						status = "Aktif"
					} else {
						status = "Kedaluwarsa"
					}
				}

				return (
					<Badge
						className={cn("bg-orange-500", {
							"bg-green-500": status === "Aktif",
							"bg-yellow-500": status === "Kedaluwarsa",
						})}
					>
						{status}
					</Badge>
				)
			},
		},
	]

	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

	const pagination = useMemo(
		() => ({
			pageIndex: search.page - 1,
			pageSize: search.limit,
		}),
		[search.page, search.limit],
	)

	const paginationInfo = useMemo(() => {
		const totalLoadedItems = results?.length ?? 0
		const currentPageItems =
			results?.slice(
				(search.page - 1) * search.limit,
				search.page * search.limit,
			) ?? emptyArray

		const canLoadMoreFromConvex = status === "CanLoadMore"
		const isLoadingFromConvex =
			status === "LoadingMore" || status === "LoadingFirstPage"
		const isExhausted = status === "Exhausted"

		let rowCount: number | undefined
		let pageCount: number | undefined

		if (isExhausted) {
			rowCount = totalLoadedItems
			pageCount = Math.max(1, Math.ceil(totalLoadedItems / search.limit))
		} else {
			pageCount = -1
		}

		return {
			currentPageItems,
			canLoadMoreFromConvex,
			isLoadingFromConvex,
			isExhausted,
			rowCount,
			pageCount,
			totalLoadedItems,
		}
	}, [results, search.page, search.limit, status])

	const table = useReactTable({
		data: paginationInfo.currentPageItems,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		state: {
			columnVisibility,
			pagination,
		},
		manualPagination: true,
		rowCount: pksData?.length ?? 0,
		onPaginationChange: (updater) => {
			const newPaginationState =
				typeof updater === "function" ? updater(pagination) : updater

			const newPage = newPaginationState.pageIndex + 1
			const newLimit = newPaginationState.pageSize

			navigate({
				search: { ...search, page: newPage, limit: newLimit },
			})

			const requiredItems = newPage * newLimit
			if (
				requiredItems > paginationInfo.totalLoadedItems &&
				paginationInfo.canLoadMoreFromConvex
			) {
				const itemsToLoad = requiredItems - paginationInfo.totalLoadedItems
				loadMore(itemsToLoad)
			}
		},
	})

	return (
		<div className="container mx-auto max-w-5xl px-4 py-2 grid gap-10 mb-20">
			<div className="@container/main flex flex-1 flex-col gap-2">
				<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
					<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-4 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-4 @5xl/main:grid-cols-4">
						<Card className="@container/card">
							<CardHeader>
								<CardDescription>Total Sentra KI</CardDescription>
								<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl p-1">
									{pksData?.length ?? 0}
								</CardTitle>
							</CardHeader>
						</Card>
					</div>
					<div className="px-4 lg:px-6">
						<DataTable table={table} showSearchField={false} />
					</div>
				</div>
			</div>
		</div>
	)
}
