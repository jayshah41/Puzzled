export default class TopNavService {
    private topNavMobileMenuFlag: boolean = false

    public getTopNavMobileMenuFlag = () => {
        return this.topNavMobileMenuFlag
    }

    public setTopNavMobileMenuFlag = () => {
        this.topNavMobileMenuFlag = !this.topNavMobileMenuFlag
    }

    // public changeTopNavOnScrollPosition = () => {
    //     let topNav = document.getElementById('topNavBar');
    //     let topNavMobileMenu = document.getElementById('mobileTopNavBar');
    //     console.log(topNav)
    //     if (topNav !== null) {
    //         if (window.scrollY > 30) {
    //             topNav.style.backgroundColor =
    //                 topNav.style.boxShadow = '0 3px 5px rgb(0 0 0 / 9%)'
    //             topNavMobileMenu.style.color = 'black'
    //         } else {
    //             if (this.topNavMobileMenuFlag) {
    //                 topNav.style.backgroundColor = '#E1E7FF'
    //                 topNavMobileMenu.style.color = 'black'
    //             } else {
    //                 topNav.style.backgroundColor = '#E1E7FF'
    //                 topNav.style.boxShadow = 'none'
    //                 topNavMobileMenu.style.color = 'white'
    //             }
    //         }
    //     }
    // };
}