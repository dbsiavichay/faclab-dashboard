import { BiHome, BiPackage } from 'react-icons/bi'
import {
    HiOutlineColorSwatch,
    HiOutlineFolder,
    HiOutlineCube,
    HiOutlineSwitchHorizontal,
    HiOutlineUserGroup,
    HiOutlineScale,
    HiOutlineOfficeBuilding,
    HiOutlineLocationMarker,
    HiOutlineTruck,
} from 'react-icons/hi'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <BiHome />,
    inventoryProducts: <BiPackage />,
    inventoryCategories: <HiOutlineFolder />,
    inventoryStock: <HiOutlineCube />,
    inventoryMovements: <HiOutlineSwitchHorizontal />,
    inventoryUnitsOfMeasure: <HiOutlineScale />,
    inventoryWarehouses: <HiOutlineOfficeBuilding />,
    inventoryLocations: <HiOutlineLocationMarker />,
    salesCustomers: <HiOutlineUserGroup />,
    purchasesSuppliers: <HiOutlineTruck />,
    groupCollapseMenu: <HiOutlineColorSwatch />,
}

export default navigationIcon
