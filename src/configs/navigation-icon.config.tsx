import { BiHome, BiPackage } from 'react-icons/bi'
import {
    HiOutlineClipboardCheck,
    HiOutlineCollection,
    HiOutlineColorSwatch,
    HiOutlineCube,
    HiOutlineFolder,
    HiOutlineLocationMarker,
    HiOutlineOfficeBuilding,
    HiOutlineQrcode,
    HiOutlineScale,
    HiOutlineSwitchHorizontal,
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
    inventoryAdjustments: <HiOutlineClipboardCheck />,
    groupCollapseMenu: <HiOutlineColorSwatch />,
}

export default navigationIcon
