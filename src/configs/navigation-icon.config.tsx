import { BiHome, BiPackage } from 'react-icons/bi'
import {
    HiOutlineColorSwatch,
    HiOutlineFolder
} from 'react-icons/hi'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <BiHome />,
    inventoryProducts: <BiPackage />,
    inventoryCategories: <HiOutlineFolder />,
    groupCollapseMenu: <HiOutlineColorSwatch />,
}

export default navigationIcon
