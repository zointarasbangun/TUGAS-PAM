import React, { useState, useEffect, useContext } from 'react';
import { View, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import Button from 'components/calcButton';
import MainButton from 'components/mainButton';
import Text from 'components/text';
import { COLOR } from 'utils/styles';
import LinearGradient from 'react-native-linear-gradient';
import ThemeContext from 'contexts/themes';
import { THEME } from 'utils/themes';
import styles from './main.styles';
const INITIAL_STATE = {
    history: [],
    left: '0',
    op: null,
    right: null,
    lastOp: null,
};
function mapStateAndPropsToStyles({ isDarkish, style, lowerContainerStyle }) {
    const componentStyles = {
        lowerContainer: [styles.lowerContainer],
        mainScreen: [styles.mainScreen],
    };
    if (isDarkish) {
        componentStyles.lowerContainer.push(styles.darkish);
    }
    if (lowerContainerStyle) {
        if (Array.isArray) {
            componentStyles.lowerContainer.push(...style);
        } else {
            componentStyles.lowerContainer.push(style);
        }
    }
    if (style) {
        if (Array.isArray) {
            componentStyles.mainScreen.push(...style);
        } else {
            componentStyles.mainScreen.push(style);
        }
    }
    return componentStyles;
}
function MainScreen(props) {
    const [theme, setTheme] = useContext(ThemeContext);
    const { mainScreen: themeMainScreenProps = {} } = theme;
    const [{ left, op, right, history, lastOp }, setState] = useState(
        INITIAL_STATE,
    );
    const mixedProps = { ...themeMainScreenProps, ...props };
    const { isDarkish, style, lowerContainerStyle } = mixedProps;
    function calc(left, op, right) {
        if (!left || !op || !right) {
            return;
        }
        const maxDecimals =
            (left.split('.')[1]?.length || 0) + (right?.split('.')[1]?.length || 0);
        switch (op) {
            case '*': {
                return getRidOfRightZeroes(multiply(left, right, maxDecimals));
            }
            case '/': {
                return getRidOfRightZeroes(divide(left, right, maxDecimals));
            }
            case '+': {
                return getRidOfRightZeroes(add(left, right, maxDecimals));
            }
            case '-': {
                return getRidOfRightZeroes(substract(left, right, maxDecimals));
            }
            default:
                throw new Error(`${op} Not implemented`);
        }
    }
    function handlePressDigit(digit) {
        const newState = {};
        const isDot = digit === '.';
        if (op) {
            if (right === '0' && digit === '0') {
                return;
            }
            if (isDot && right && right.indexOf('.') !== -1) {
                return;
            }
            newState.right =
                right === '0' || !right ? (isDot ? '0.' : digit) : `${right}${digit}`;
        } else {
            if (left === '0' && digit === '0') {
                return;
            }
            if (digit === '.' && left.indexOf('.') !== -1) {
                return;
            }
            newState.left =
                left === '0' || !left ? (isDot ? '0.' : digit) : `${left}${digit}`;
        }
        setState((prevState) => ({
            ...prevState,
            ...newState,
        }));
    }
    function getRidOfRightZeroes(result) {
        const [, decimals] = result.split('.');
        if (!decimals) {
            return result;
        }
        let charsToRemove = 0;
        const len = result.length - 1;
        for (let i = len; i > -1; i--) {
            const lastChar = result[i];
            if (lastChar === '0') {
                charsToRemove++;
            } else if (lastChar === '.') {
                charsToRemove++;
                break;
            } else {
                break;
            }
        }
        if (!charsToRemove) {
            return result;
        }
        return result.slice(0, -charsToRemove);
    }
    function divide(left, right, decimals = 0) {
        if (left === '0' || right === '0') {
            return '0';
        }
        return (+left / +right).toFixed(decimals);
    }
    function multiply(left, right, decimals = 0) {
        if (left === '0' || right === '0') {
            return '0';
        }
        return (+left * +right).toFixed(decimals);
    }
    function add(left, right, decimals = 0) {
        return (+left + +right).toFixed(decimals);
    }
    function substract(left, right, decimals = 0) {
        return (+left - +right).toFixed(decimals);
    }
    function restart(initialValue = '0') {
        setState({
            ...INITIAL_STATE,
            left: '' + initialValue,
        });
    }
    function handlePressOp(nextOp) {
        let nextState = {};
        if (op && right) {
            const result = calc(left, op, right);
            nextState = {
                right: null,
                left: result,
                history: [1],
            };
        }
        setState((prevState) => ({
            ...prevState,
            ...nextState,
            op: nextOp,
        }));
    }
    function handlePressSwitchSign() {
        const nextState = {};
        if (op) {
            if (right === '0') {
                return;
            }
            nextState.right = right.startsWith('-') ? right.slice(1) : '-' + right;
        } else {
            if (left === '0') {
                return;
            }
            nextState.left = left.startsWith('-') ? left.slice(1) : '-' + left;
        }
        setState((prevState) => ({
            ...prevState,
            ...nextState,
        }));
    }
    function handlePressPercentage() {
        const nextState = {};
        if (op && right) {
            nextState.right = `${+right / 100}`;
        } else {
            nextState.left = `${+left / 100}`;
        }
        setState((prevState) => ({
            ...prevState,
            ...nextState,
        }));
    }
    function equal() {
        let nextState = null;
        if (op && right) {
            nextState = {
                left: calc(left, op, right),
                right: null,
                lastOp: {
                    op,
                    right,
                },
            };
        } else if (lastOp) {
            const { op, right } = lastOp;
            nextState = {
                left: calc(left, op, right),
                right: null,
            };
        } else if (op) {
            nextState = {
                left: calc(left, op, left),
                right: null,
                lastOp: {
                    op,
                    right: left,
                },
            };
        }
        if (!nextState) {
            return;
        }
        setState((prevState) => ({
            ...prevState,
            ...nextState,
        }));
    }
    function debug() {
        return JSON.stringify({ left, op, right }, null, '\t');
    }
    function handlePressPinkishTheme() {
        setTheme(THEME.PINKISH);
    }
    function handlePressGreenishTheme() {
        setTheme(THEME.GREENISH);
    }
    const {
        mainScreen: mainScreenStyles,
        lowerContainer: lowerContainerStyles,
        adornment: adornmentStyles,
    } = mapStateAndPropsToStyles({
        isDarkish,
        style,
        lowerContainerStyle,
    });
    return (
        <View style={mainScreenStyles}>
            <View style={styles.themesContainer}>
                <TouchableOpacity onPress={handlePressPinkishTheme}>
                    <LinearGradient style={styles.theme} colors={COLOR.PINKISH} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePressGreenishTheme}>
                    <LinearGradient style={styles.theme} colors={COLOR.GREENISH} />
                </TouchableOpacity>
            </View>
            <View style={styles.upperContainer}>
                {/* <View>
<Text>{debug()}</Text>
</View> */}
                <View style={styles.historyContainer}>
                    {history.map((result, i) => {
                        return (
                            <Text
                                size="sm"
                                key={`${i}-${result}`}
                                onPress={() => restart(result)}>
                                {result}
                            </Text>
                        );
                    })}
                </View>
                <Text size="lg">{right || left}</Text>
                <View style={adornmentStyles} />
            </View>
            <View style={lowerContainerStyles}>
                <View style={styles.row}>
                    <Button onPress={() => restart(0)}>C</Button>
                    <Button onPress={() => handlePressSwitchSign()}>+/-</Button>
                    <Button onPress={() => handlePressPercentage()}>%</Button>
                    <Button onPress={() => handlePressOp('/')}>/</Button>
                </View>
                <View style={styles.row}>
                    <Button onPress={() => handlePressDigit('7')}>7</Button>
                    <Button onPress={() => handlePressDigit('8')}>8</Button>
                    <Button onPress={() => handlePressDigit('9')}>9</Button>
                    <Button onPress={() => handlePressOp('*')}>x</Button>
                </View>
                <View style={styles.row}>
                    <Button onPress={() => handlePressDigit('4')}>4</Button>
                    <Button onPress={() => handlePressDigit('5')}>5</Button>
                    <Button onPress={() => handlePressDigit('6')}>6</Button>
                    <Button onPress={() => handlePressOp('+')}>+</Button>
                </View>
                <View style={styles.row}>
                    <Button onPress={() => handlePressDigit('1')}>1</Button>
                    <Button onPress={() => handlePressDigit('2')}>2</Button>
                    <Button onPress={() => handlePressDigit('3')}>3</Button>
                    <Button onPress={() => handlePressOp('-')}>-</Button>
                </View>
                <View style={styles.row}>
                    <Button onPress={() => handlePressDigit('0')}>0</Button>
                    <Button onPress={() => handlePressDigit('.')}>.</Button>
                    <MainButton style={styles.mainButton} onPress={equal}>
                        =
                    </MainButton>
                </View>
            </View>
        </View>
    );
}
MainScreen.propTypes = {
    style: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.object,
        PropTypes.arrayOf(PropTypes.number),
        PropTypes.arrayOf(PropTypes.object),
    ]),
    lowerContainerStyle: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.object,
        PropTypes.arrayOf(PropTypes.number),
        PropTypes.arrayOf(PropTypes.object),
    ]),
};
export default MainScreen;