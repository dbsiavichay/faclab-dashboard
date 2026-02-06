import { BiHome, BiPackage } from 'react-icons/bi'
import {
    HiOutlineColorSwatch,
    HiOutlineFolder,
    HiOutlineCube,
    HiOutlineSwitchHorizontal
} from 'react-icons/hi'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <BiHome />,
    inventoryProducts: <BiPackage />,
    inventoryCategories: <HiOutlineFolder />,
    inventoryStock: <HiOutlineCube />,
    inventoryMovements: <HiOutlineSwitchHorizontal />,
    groupCollapseMenu: <HiOutlineColorSwatch />,
}

export default navigationIcon
