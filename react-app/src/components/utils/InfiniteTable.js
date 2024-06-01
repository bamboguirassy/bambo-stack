import { Skeleton, Table } from "antd";
import PaginationInfo from "./PaginationInfo";
import React from "react";

export default function InfiniteTable({ dataSource, rowKey, loadMore, columns, title, paginationData, loading }) {
    if (columns && columns.length > 0 && !columns.find(c => c.dataIndex === 'rowNumber')) {
        columns = [
            {
                title: 'N°',
                dataIndex: 'rowNumber',
                key: 'rowNumber',
                render: (text, record, index) => index + 1,
                width: 40,
                fixed: 'left'
            },
            ...columns
        ];
    }



    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 200) {
            loadMore();
        }
    }


    return (
        <>
            <Table pagination={false} scroll={{ x: 1300, y: 500 }}
                rowKey={rowKey} onScroll={($e) => handleScroll($e)}
                dataSource={dataSource} columns={columns}
                title={
                    () => (
                        title
                    )
                } />
            <Skeleton loading={loading} active />
            <PaginationInfo loadedCount={dataSource.length ?? 0} paginationData={paginationData} />
        </>
    )
}