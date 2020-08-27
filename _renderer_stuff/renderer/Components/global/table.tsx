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
    flex-wrap: wrap;
  
`;

export const THeadCell:any = styled.th`
    flex: ${(props: any) => (props.flex ? props.flex : '1 1 0')};
`;

export const TBody = styled.tbody`
    display: flex;
    flex-direction: column;
    text-align: center;
    color: white;
    font-size: 12px;

    
`;
export const TBodyRow = styled.tr`
    display: flex;
    flex-direction: row;
    align-items: center;
    opacity: 0.7;
    cursor: pointer;
    height: 25px;
    background-color: transparent;
    margin: 5px;
    &&:hover{
        opacity: 1;
    }
    
`;
export const TBodyCell:any = styled.td`
    flex: ${(props: any) => (props.flex ? props.flex : '1 1 0')};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${(props: any) => {
        switch(props.color) {
            case 'SUCCESS':
                return 'green';
            case 'ERROR':
                return 'red';
            case 'WARN':
                return 'orange';
            default: return 'inherit';
        } 
    }}
`;