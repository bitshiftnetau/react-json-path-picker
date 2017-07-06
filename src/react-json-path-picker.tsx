/**
 * author: akunzeng
 * 20170705
 * 
 * notice!!!: JsonPathPick's prop - json, shouldn't have any key named "." or "[" or "]", otherwise the getTargetByJsonPath function (or other function you defined) will not work properlly.
 */

import * as React from 'react'
import * as styles from './style.css'

interface P {
    json: string // json string
    onChoose?(path :string) :any
}

interface S {
    choosen: string|null // a path string, joined by " ",  like ".a .b [3] .c"
}

export class JsonPathPicker extends React.Component<P, S> {
    constructor(props: P) {
        super(props)
        this.state = {
            choosen: null
        }
    }
    componentWillReceiveProps(nextp: P) {
        if (nextp.json !== this.props.json) { // string compare
            this.setState({
                choosen: null // reset choosen
            })
        }
    }
    shouldComponentUpdate(nextp: P, nexts: S) {
        if (nextp.json !== this.props.json) {
            return true
        } else if (nexts.choosen !== this.state.choosen) {
            return true
        } else {
            return false
        }
    }
    choose = (e: any) => {
        let target = e.target
        if (target.hasAttribute('data-pathKey')) {

            let pathKey = target.getAttribute('data-pathKey')
            let choosenPath

            if (target.hasAttribute('data-chooseArr')) {

                choosenPath = this.state.choosen
                let tmp = choosenPath.split(' ')
                let idx = pathKey.split(' ').length
                tmp[idx] = '[*]'
                choosenPath = tmp.join(' ')

            } else {
                choosenPath = pathKey
            }

            this.setState({
                choosen: choosenPath
            }, ()=> {
                this.props.onChoose && this.props.onChoose(this.state.choosen)
            })

        }
    }
    render() {
        console.log('!!!!')
        let jsonObj: any
        try {
            jsonObj = JSON.parse(this.props.json)
        } catch (error) {
            console.log(error)
            return <div>Wrong json string input</div>
        }
        // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
        return (<div onClick={this.choose}>
            { json2Jsx(this.state.choosen, jsonObj) }
        </div>)
    }
}


/**
 * get the target object of a json by path
 */
// export function getTargetByJsonPath(json: string, path: string) :any {
//     let obj = JSON.parse(json)
//     if (path == '') {
//         return obj
//     } else {
//         let attrs = path.split(' ')
//         attrs.shift() // shift the first "" in attrs
//         let target = obj
//         for (let attr of attrs) {
//             if (attr[0] === '.') {
//                 target = target[attr.slice(1)]
//             } else if (attr === '[*]') {
//                 //td
//             } else { // [x]
//                 attr = attr.slice(1)
//                 attr = attr.slice(0, attr.length-1)
//                 target = target[parseInt(attr)]
//             }
//         }
//         return target
//     }
// }


/**
 * Check if a string represents a valid url
 * @return boolean
 */
function isUrl(str: string) :boolean {
    let regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(str)
}

function escape(str: string) :string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}


/**
 * recursively generate jsxs by json data
 * @param choosenPath
 * @param jsonObj 
 * @param isLast :is the last child or not
 * @param pathKey :now json path from root
 * @return reactElements
 */
function json2Jsx(choosenPath: string|null, jsonObj: any, isLast: boolean = true, pathKey: string = '') :React.ReactElement<any> {

    if (jsonObj === null) {
        return renderNull(choosenPath, isLast, pathKey)
    } else if (jsonObj === undefined) {
        return renderUndefined(choosenPath, isLast, pathKey)
    } else if (Array.isArray(jsonObj)) {
        return renderArray(choosenPath, isLast, pathKey, jsonObj)
    } else if (typeof jsonObj == 'string') {
        return renderString(choosenPath, isLast, pathKey, jsonObj)
    } else if (typeof jsonObj == 'number') {
        return renderNumber(choosenPath, isLast, pathKey, jsonObj)
    } else if (typeof jsonObj == 'boolean') {
        return renderBoolean(choosenPath, isLast, pathKey, jsonObj)
    } else if (typeof jsonObj == 'object') {
        return renderObject(choosenPath, isLast, pathKey, jsonObj)
    } else {
        return null
    }

}


// various types' render
function renderNull(choosenPath: string, isLast: boolean, pathKey: string) :React.ReactElement<any> {
    return (<span className={styles.json_literal}>
        <i data-pathKey={pathKey} className={getPickerStyle(getRelationship(choosenPath, pathKey))}>📋</i>
        <span>{'null'} {isLast?'':','}</span>
    </span>)
}

function renderUndefined(choosenPath: string, isLast: boolean, pathKey: string) :React.ReactElement<any> {
    return (<span className={styles.json_literal}>
        <i data-pathKey={pathKey} className={getPickerStyle(getRelationship(choosenPath, pathKey))}>📋</i>
        <span>{'undefined'} {isLast?'':','}</span>
    </span>)
}

function renderString(choosenPath: string, isLast: boolean, pathKey: string, str: string) :React.ReactElement<any> {
    str = escape(str)
    if (isUrl(str)) {
        return (<span>
            <i data-pathKey={pathKey} className={getPickerStyle(getRelationship(choosenPath, pathKey))}>📋</i>
            <a target="_blank" href={str} className={styles.json_string}>
                <span>"{str}" {isLast?'':','}</span>
            </a>
        </span>)
    } else {
        return (<span className={styles.json_string}>
            <i data-pathKey={pathKey} className={getPickerStyle(getRelationship(choosenPath, pathKey))}>📋</i>
            <span>"{str}" {isLast?'':','}</span>
        </span>)
    }
}

function renderNumber(choosenPath: string, isLast: boolean, pathKey: string, num: number) :React.ReactElement<any> {
    return (<span className={styles.json_literal}>
        <i data-pathKey={pathKey} className={getPickerStyle(getRelationship(choosenPath, pathKey))}>📋</i> 
        <span>{num} {isLast?'':','}</span>
    </span>)
}

function renderBoolean(choosenPath: string, isLast: boolean, pathKey: string, bool: boolean) :React.ReactElement<any> {
    return (<span className={styles.json_literal}>
        <i data-pathKey={pathKey} className={getPickerStyle(getRelationship(choosenPath, pathKey))}>📋</i>
        <span>{bool} {isLast?'':','}</span>
    </span>)
}

function renderObject(choosenPath: string, isLast: boolean, pathKey: string, obj: any) :React.ReactElement<any> {
    let relation = getRelationship(choosenPath, pathKey)

    let keys = Object.keys(obj)
    let length = keys.length
    if (length > 0) {
        return (<div className={relation==1 ? styles.picked_tree : ''}>
            <div>
                <span>{'{'}</span>
                <i data-pathKey={pathKey} className={getPickerStyle(relation)}>📋</i>
            </div>
            <ul className={styles.json_dict}>
                {
                    keys.map((key, idx) => {
                        let nextPathKey = `${pathKey} .${key}`
                        return (<li key={nextPathKey}>
                            <span className={`${styles.json_string} ${styles.json_key}`}>{key}</span>
                            <span> : </span>
                            { json2Jsx(choosenPath, obj[key], idx == length-1 ? true : false, nextPathKey) }
                        </li>)
                    })
                }
            </ul>
            <div>{'}'} {isLast?'':','}</div>
        </div>)
    } else {
        return (<span>
            <i data-pathKey={pathKey} className={getPickerStyle(relation)}>📋</i>
            <span>{"{ }"} {isLast?'':','}</span>
        </span>)
    }
}

function renderArray(choosenPath: string, isLast: boolean, pathKey: string, arr: any[]) :React.ReactElement<any> {
    let relation = getRelationship(choosenPath, pathKey)

    let length = arr.length
    if (length > 0) {
        return (<div className={relation==1 ? styles.picked_tree : ''}>
            <div>
                { relation==2 ? <i data-pathKey={pathKey} data-chooseArr="1" className={getPickArrStyle(choosenPath, pathKey)}>[✚]</i> : null }
                <span>{'['}</span>
                <i data-pathKey={pathKey} className={getPickerStyle(relation)}>📋</i>
            </div>
            <ol className={styles.json_array}>
                {
                    arr.map((value, idx) => {
                        let nextPathKey = `${pathKey} [${idx}]`
                        return (<li key={nextPathKey}>
                            { json2Jsx(choosenPath, value, idx == length-1 ? true : false, nextPathKey) }
                        </li>)
                    })
                }
            </ol>
            <div>{']'} {isLast?'':','}</div>
        </div>)
    } else {
        return (<span>
            <i data-pathKey={pathKey} className={getPickerStyle(relation)}>📋</i>
            <span>{"[ ]"} {isLast?'':','}</span>
        </span>)
    }
}

/**
 * get the relationship between now path and the choosenPath
 * 0 other
 * 1 self
 * 2 ancestor
 */
function getRelationship(choosenPath: string|null, path: string) :number {
    
    if (choosenPath === null) return 0

    let choosenAttrs = choosenPath.split(' ')
    choosenAttrs.shift()
    let choosenLen = choosenAttrs.length

    let nowAttrs = path.split(' ')
    nowAttrs.shift()
    let nowLen = nowAttrs.length

    if (nowLen > choosenLen) return 0

    for (let i=0; i<nowLen; i++) {
        let ok: boolean
        
        if (nowAttrs[i] === choosenAttrs[i]) {
            ok = true
        } else if (nowAttrs[i][0] === '[' && choosenAttrs[i][0] === '[' && choosenAttrs[i][1] === '*') {
            ok = true
        } else {
            ok = false
        }

        if (!ok) return 0
    }

    return nowLen == choosenLen ? 1 : 2
}

/**
 * get picker's className, for ditinguishing picked or not or ancestor of picked entity
 */
function getPickerStyle(relation: number) :string {
    if (relation == 0) {
        return styles.pick_path
    } else if (relation == 1) {
        return styles.pick_path + ' ' + styles.picked
    } else {
        return styles.pick_path + ' ' + styles.pick_path_ancestor
    }
}

function getPickArrStyle(choosenPath: string, nowPath: string) :string {
    let csp = choosenPath.split(' ')
    let np = nowPath.split(' ')
    if (csp[np.length] == '[*]') {
        return styles.pick_arr + ' ' + styles.picked_arr
    } else {
        return styles.pick_arr
    }
}