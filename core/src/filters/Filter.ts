namespace dou2d {
    /**
     * 
     * @author wizardc
     */
    export class Filter {
        public type: string = null;

        public $id: number = null;

        public $uniforms: any;

        protected paddingTop: number = 0;

        protected paddingBottom: number = 0;

        protected paddingLeft: number = 0;

        protected paddingRight: number = 0;

        public $obj: any;

        constructor() {
            this.$uniforms = {};
        }

        public $toJson(): string {
            return '';
        }

        protected updatePadding(): void {
        }

        public onPropertyChange(): void {
            let self = this;
            self.updatePadding();
        }
    }
}
