import { BiHome, BiPackage } from 'react-icons/bi'
import {
    HiOutlineColorSwatch
} from 'react-icons/hi'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <BiHome />,
    inventoryProducts: <BiPackage />,
    groupCollapseMenu: <HiOutlineColorSwatch />,
}

export default navigationIcon
