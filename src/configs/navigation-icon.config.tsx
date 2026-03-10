import { BiHome, BiPackage } from 'react-icons/bi'
import {
    HiOutlineBell,
    HiOutlineClipboardCheck,
    HiOutlineCollection,
    HiOutlineCube,
    HiOutlineDocumentText,
    HiOutlineFolder,
    HiOutlineLocationMarker,
    HiOutlineOfficeBuilding,
    HiOutlineQrcode,
    HiOutlineScale,
    HiOutlineShoppingCart,
    HiOutlineSwitchHorizontal,
    HiOutlineSwitchVertical,
    HiOutlineTruck,
    HiOutlineUserGroup,
} from 'react-icons/hi'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <BiHome />,
    catalogProducts: <BiPackage />,
    catalogCategories: <HiOutlineFolder />,
    inventoryStock: <HiOutlineCube />,
    inventoryMovements: <HiOutlineSwitchHorizontal />,
    catalogUnitsOfMeasure: <HiOutlineScale />,
    inventoryWarehouses: <HiOutlineOfficeBuilding />,
    inventoryLocations: <HiOutlineLocationMarker />,
    salesCustomers: <HiOutlineUserGroup />,
    inventoryLots: <HiOutlineCollection />,
    inventorySerials: <HiOutlineQrcode />,
    purchasesSuppliers: <HiOutlineTruck />,
    purchasesPurchaseOrders: <HiOutlineDocumentText />,
    inventoryAdjustments: <HiOutlineClipboardCheck />,
    inventoryTransfers: <HiOutlineSwitchVertical />,
    inventoryReports: <HiOutlineDocumentText />,
    salesSales: <HiOutlineShoppingCart />,
    inventoryAlerts: <HiOutlineBell />,
}

export default navigationIcon
