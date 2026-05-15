import { useState } from 'react'

function useCrudOperations<T extends { id: string | number }>() {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<T | null>(null)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const openCreate = () => {
        setSelectedItem(null)
        setIsCreateOpen(true)
    }

    const openEdit = (item: T) => {
        setSelectedItem(item)
        setIsEditOpen(true)
    }

    const openDelete = (item: T) => {
        setSelectedItem(item)
        setIsDeleteOpen(true)
    }

    const closeAll = () => {
        setIsCreateOpen(false)
        setIsEditOpen(false)
        setIsDeleteOpen(false)
        setSelectedItem(null)
    }

    const onPaginationChange = (newPageIndex: number, newPageSize: number) => {
        setPageIndex(newPageIndex)
        setPageSize(newPageSize)
    }

    return {
        isCreateOpen,
        isEditOpen,
        isDeleteOpen,
        selectedItem,
        openCreate,
        openEdit,
        openDelete,
        closeAll,
        pageIndex,
        pageSize,
        onPaginationChange,
    }
}

export default useCrudOperations
