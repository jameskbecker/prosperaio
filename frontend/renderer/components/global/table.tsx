import styled from 'styled-components';
import theme from './theme';

export default styled.table`
    margin: 0 10px 10px 10px;
    table-layout: fixed;
    flex: 1 1 0;
    height: 100%;
`;

export const THead = styled.thead`
    color: white;
    background-color: ${theme.grey_4};
`;

export const THeadRow = styled.tr`
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 5vh;
    margin: 0 5px;
    flex-wrap: wrap;
  
`;

export const THeadCell:any = styled.th`
    flex: ${(props: any) => (props.flex ? props.flex : '1 1 0')};
    justify-content: flex-start;
    justify-items: flex-start;
    text-align: left;
    margin: 0 5px;
 
`;

export const TBody = styled.tbody`
    display: flex;
    flex-direction: column;
    text-align: left;
    color: white;
    font-size: 12px;
    

    
`;
export const TBodyRow = styled.tr`
    display: flex;
    flex-direction: row;
    align-items: center;
   
    opacity: 0.8;
    /* cursor: pointer; */
    padding: 1.5vh 0;
    border-radius: 5px;
    background-color: ${theme.grey_5};
    margin: 5px;
    &&:hover{
        opacity: 1;
    }
    
`;
export const TBodyCell:any = styled.td`
    flex: ${(props: any) => (props.flex ? props.flex : '1 1 0')};
    overflow: hidden;
    display: flex;
    margin: 0 5px;
    justify-content: flex-start;
    text-align: left;
    justify-items: space-evenly;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${(props: any) => {
        switch(props.color) {
            case 'SUCCESS':
                return theme.success;
            case 'ERROR':
                return theme.error;
            case 'WARN':
                return theme.warning;
            default: return 'inherit';
        } 
    }}
`;